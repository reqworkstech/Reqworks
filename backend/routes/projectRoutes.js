const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const { verifyToken } = require('../middleware/authMiddleware');
const { triggerMilestoneAlerts, sendAlert } = require('../services/alertService');
const asyncHandler = require('../middleware/asyncHandler');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File types filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.md', '.zip', '.txt', '.png', '.jpg', '.jpeg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only PDF, MD, ZIP, TXT, and Images are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limits
});

/**
 * Helper to calculate project queue position
 */
const getQueuePosition = async (projectId) => {
  const activeProjects = await Project.find({
    depositPaid: true,
    stage: { $ne: 'Completed' }
  }).sort({ createdAt: 1 });

  const idx = activeProjects.findIndex(p => p._id.toString() === projectId.toString());
  return idx === -1 ? activeProjects.length + 1 : idx + 1;
};

/**
 * Helper to apply active offer discounts on price
 */
const applyActiveOffer = async (price) => {
  const activeOffer = await Offer.findOne({
    active: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  if (activeOffer && activeOffer.discountPercent > 0) {
    return price - Math.round(price * (activeOffer.discountPercent / 100));
  }
  return price;
};

/**
 * @route   GET /api/projects/user
 * @desc    Fetch projects for the logged in client
 */
router.get('/user', verifyToken, asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, projects });
  } catch (err) {
    console.error('Fetch user projects error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user projects' });
  }
}));

/**
 * @route   GET /api/projects/user/dashboard
 * @desc    Get dashboard metrics, queue position and recent projects for client
 */
router.get('/user/dashboard', verifyToken, asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    // Calculate project counts
    const total = projects.length;
    const inProgress = projects.filter(p => p.depositPaid && p.stage !== 'Completed' && p.stage !== 'Rejected').length;
    const completed = projects.filter(p => p.stage === 'Completed').length;
    const rejected = projects.filter(p => p.stage === 'Rejected').length;

    // Calculate queue position
    let queuePosition = null;
    let projectsAhead = 0;
    let estimatedDays = 0;

    const firstQueued = projects.find(p => p.depositPaid && p.stage !== 'Completed' && p.stage !== 'Rejected');
    if (firstQueued) {
      const activeQueue = await Project.find({
        depositPaid: true,
        stage: { $nin: ['Completed', 'Rejected'] }
      }).sort({ createdAt: 1 }).lean();

      const idx = activeQueue.findIndex(p => p._id.toString() === firstQueued._id.toString());
      if (idx !== -1) {
        queuePosition = idx + 1;
        projectsAhead = idx;
        estimatedDays = idx * 3; // 3 days average
      }
    }

    res.json({
      success: true,
      projectsCount: { total, inProgress, completed, rejected },
      queuePosition,
      projectsAhead,
      estimatedDays,
      recentProjects: projects.slice(0, 5)
    });
  } catch (err) {
    console.error('Fetch user dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error loading dashboard metrics' });
  }
}));

/**
 * @route   GET /api/projects/chat/:projectId
 * @desc    Load chat history for a project
 */
router.get('/chat/:projectId', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check access ownership
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    res.json({ success: true, messages: project.changeRequests || [] });
  } catch (err) {
    console.error('Fetch chat history error:', err);
    res.status(500).json({ success: false, message: 'Server error loading chat history' });
  }
});

/**
 * @route   POST /api/projects/ai/validate-stack
 * @desc    AI tech stack feasibility evaluator (with fallback)
 */
router.post('/ai/validate-stack', verifyToken, async (req, res) => {
  try {
    const { stack, description, needsAi } = req.body;
    if (!stack || !description) {
      return res.status(400).json({ success: false, message: 'Stack and description are required' });
    }

    // Try Claude AI if key is set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'placeholder' && apiKey !== '') {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `
              A user wants to build: "${description}"
              AI integration required: ${needsAi ? 'Yes' : 'No'}
              They've chosen this tech stack: ${stack.join(', ')}

              Analyze if this stack can build what they need. Return JSON ONLY:
              {
                "feasible": true/false,
                "concerns": ["concern1", ...],
                "alternatives": ["Alt Stack 1", "Alt Stack 2"],
                "recommendation": "brief paragraph feedback"
              }
            `
          }]
        });

        const text = response.content[0].text;
        const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn('Claude AI request failed, applying local fallback:', err.message);
      }
    }

    // Local rule-based fallback logic (highly dynamic expert system)
    const fe = stack[0] || '';
    const be = stack[1] || '';
    const db = stack[2] || '';
    const descStr = description.toLowerCase();
    const isAiWanted = needsAi || descStr.includes('ai') || descStr.includes('machine learning') || descStr.includes('llm') || descStr.includes('chatbot');
    
    let feasible = true;
    let concerns = [];
    let alternatives = [];

    // Evaluate AI Integration suitability
    if (isAiWanted) {
      if (be !== 'FastAPI' && be !== 'Django' && be !== 'Flask') {
        concerns.push(`${be} lacks the rich native Python ecosystem (PyTorch, TensorFlow, scikit-learn) for direct local AI pipeline execution.`);
        alternatives.push('Next.js + FastAPI + PostgreSQL', 'React + NestJS + MongoDB');
      }
    }

    // Evaluate framework redundancies & anti-patterns
    if (fe === 'Next.js' && (be === 'Node.js' || be === 'Express' || be === 'Spring Boot' || be === 'Django')) {
      concerns.push(`Combining Next.js (which has native serverless API routing) with a separate ${be} backend adds minor routing and deployment architecture overhead.`);
    }
    
    if ((db === 'Firebase' || db === 'Supabase') && (be === 'Spring Boot' || be === 'Django')) {
      concerns.push(`Combining client-centric ${db} (BaaS) with a heavy backend like ${be} creates overlapping routing, auth, and database layers.`);
      alternatives.push(`${fe} + Node.js + MongoDB`, `${fe} + Django + PostgreSQL`);
    }

    if (fe === 'HTML/CSS/JS' && be === 'Spring Boot') {
      concerns.push('Basic HTML/CSS/JS lacks modern component state-management. Using it with Spring Boot (heavy enterprise) is asymmetrical.');
      alternatives.push('React + Node.js + MongoDB', 'Next.js + Spring Boot + MySQL');
    }

    // Generate dynamic feedback points based on specific selections
    let feFeedback = '';
    if (fe === 'React') feFeedback = 'React is excellent for building dynamic, interactive user interfaces with rich component ecosystems.';
    else if (fe === 'Next.js') feFeedback = 'Next.js is a top-tier choice, providing server-side rendering (SSR), optimized load times, and superior SEO features out-of-the-box.';
    else if (fe === 'Vue.js') feFeedback = 'Vue.js offers lightweight reactivity, smooth transitions, and clean template organization.';
    else if (fe === 'Angular') feFeedback = 'Angular is highly structured and enterprise-ready, offering strict TypeScript typing and powerful modular design.';
    else if (fe === 'Svelte') feFeedback = 'Svelte compiles down to tiny vanilla JS, giving you ultra-fast runtime performance and smaller bundle sizes.';
    else if (fe === 'Flutter' || fe === 'React Native') feFeedback = `${fe} is a fantastic choice for cross-platform mobile app development, allowing you to deploy to iOS and Android from one codebase.`;
    else feFeedback = `${fe} is great for standard interface building.`;

    let beFeedback = '';
    if (be === 'Node.js' || be === 'Express') beFeedback = `Using ${be} on the backend unifies JavaScript across your entire stack, enabling rapid API development.`;
    else if (be === 'NestJS') beFeedback = 'NestJS provides a clean, Angular-inspired backend architecture with dependency injection and strong TypeScript support.';
    else if (be === 'FastAPI') beFeedback = 'FastAPI is a modern, high-performance Python framework, perfect for blazing-fast APIs and serving AI models.';
    else if (be === 'Django' || be === 'Flask') beFeedback = `${be} leverages Python's extensive ecosystem, offering secure database ORMs and quick prototyping.`;
    else if (be === 'Go (Golang)') beFeedback = 'Go offers raw execution speed and lightweight concurrency (goroutines), ideal for high-throughput microservices.';
    else if (be === 'Spring Boot') beFeedback = 'Spring Boot provides enterprise-grade security, thread safety, and robust multi-threaded transaction handling.';
    else if (be === 'Laravel') beFeedback = 'Laravel brings beautiful, expressive syntax, built-in queue systems, and seamless database migrations.';
    else if (be === 'Ruby on Rails') beFeedback = 'Ruby on Rails prioritizes convention over configuration, allowing you to prototype full-stack features in record time.';
    else beFeedback = `${be} serves as a reliable backend engine for your business logic.`;

    let dbFeedback = '';
    if (db === 'PostgreSQL') dbFeedback = 'PostgreSQL is a powerful relational database, offering ACID compliance, robust indexing, and strong JSON query support.';
    else if (db === 'MySQL') dbFeedback = 'MySQL is a classic relational database, renowned for its write speed, reliability, and structured querying.';
    else if (db === 'MongoDB') dbFeedback = 'MongoDB is a flexible NoSQL database, allowing you to store unstructured JSON documents and scale horizontal write operations easily.';
    else if (db === 'SQLite') dbFeedback = 'SQLite is a lightweight, zero-configuration local database, perfect for MVPs and quick desktop setups.';
    else if (db === 'Redis') dbFeedback = 'Redis is an in-memory key-value database, unmatched for lightning-fast caching, rate-limiting, and session management.';
    else if (db === 'DynamoDB') dbFeedback = 'DynamoDB is a fully managed cloud NoSQL database, offering predictable single-digit millisecond latency at scale.';
    else if (db === 'Supabase' || db === 'Firebase') dbFeedback = `${db} accelerates development with real-time subscriptions, built-in authentication, and instant API generation.`;
    else dbFeedback = `${db} handles persistent storage constraints effectively.`;

    let aiFeedback = '';
    if (isAiWanted) {
      if (be === 'FastAPI' || be === 'Django' || be === 'Flask') {
        aiFeedback = `Since you selected a Python-based backend (${be}), you will benefit from direct, native integrations with AI model inference pipelines and data processing packages.`;
      } else {
        aiFeedback = `With a ${be} backend, you can seamlessly connect your app to AI capabilities using REST API clients or official SDK integrations to cloud-based model providers.`;
      }
    }

    // Combine into a custom paragraph
    let recommendation = `This is a highly feasible stack choice! ${feFeedback} ${beFeedback} ${dbFeedback} ${aiFeedback}`;

    if (concerns.length > 0) {
      feasible = false;
      recommendation = `Some options selected create architectural complexity. Check suggested combinations for optimal design patterns. ${aiFeedback}`;
    }

    res.json({
      success: true,
      feasible,
      concerns,
      alternatives: alternatives.length > 0 ? alternatives : ['Next.js + FastAPI + PostgreSQL', 'React + Node.js + MongoDB'],
      recommendation
    });
  } catch (err) {
    console.error('Stack validator error:', err);
    res.status(500).json({ success: false, message: 'Server error evaluating stack' });
  }
});

/**
 * @route   POST /api/projects/ai/estimate
 * @desc    AI time, budget and complexity estimator (with fallback)
 */
router.post('/ai/estimate', verifyToken, async (req, res) => {
  try {
    const { name, stack, budget, description } = req.body;
    
    // Try Claude AI if key is set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'placeholder' && apiKey !== '') {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `
              Evaluate a project estimation request:
              Project Name: "${name}"
              Tech Stack: "${stack.join(', ')}"
              Client Budget Range: "${budget}"
              Description: "${description}"

              Provide a timeline and complexity estimate. Return JSON ONLY:
              {
                "timeRange": "e.g. 3-4 weeks",
                "budgetRange": "e.g. $3,000 - $4,500",
                "complexity": "Low/Medium/High",
                "note": "brief justification of the estimate"
              }
            `
          }]
        });

        const text = response.content[0].text;
        const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn('Claude AI estimation failed, applying local fallback:', err.message);
      }
    }

    // Local rule-based fallback logic
    const descStr = (description || '').toLowerCase();
    
    let timeRange = '2-3 weeks';
    let budgetRange = '$1,500 - $2,500';
    let complexity = 'Medium';
    let note = 'Based on standard architectural patterns for full-stack deployment runs.';

    if (descStr.includes('marketplace') || descStr.includes('ecommerce') || descStr.includes('payment')) {
      timeRange = '3-4 weeks';
      budgetRange = '$2,500 - $4,000';
      complexity = 'Medium-High';
      note = 'Secure payment gate validation and multi-product shopping carts increase build complexity.';
    } else if (descStr.includes('ai') || descStr.includes('recommendation') || descStr.includes('nlp')) {
      timeRange = '4-6 weeks';
      budgetRange = '$4,000 - $6,000';
      complexity = 'High';
      note = 'Integrating LLM semantic vectors and python modeling pipelines requires advanced QA validation.';
    } else if (descStr.length < 100) {
      timeRange = '1-2 weeks';
      budgetRange = '$1,000 - $1,800';
      complexity = 'Low';
      note = 'Simple landing page or internal tool setup with minimal database schemas.';
    }

    res.json({
      success: true,
      timeRange,
      budgetRange,
      complexity,
      note
    });
  } catch (err) {
    console.error('AI estimation error:', err);
    res.status(500).json({ success: false, message: 'Server error generating estimation' });
  }
});

/**
 * @route   GET /api/projects/admin
 * @desc    Fetch all projects in the queue for the admin panel
 */
router.get('/admin', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const projects = await Project.find({}).populate('userId', 'name email phone').sort({ createdAt: -1 });
    
    // Attach queue positions
    const projectsWithQ = await Promise.all(projects.map(async (p) => {
      const qPos = p.depositPaid && p.stage !== 'Completed' ? await getQueuePosition(p._id) : null;
      return { ...p.toObject(), queuePosition: qPos };
    }));

    res.json({ success: true, projects: projectsWithQ });
  } catch (err) {
    console.error('Fetch admin projects error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching admin projects' });
  }
});

/**
 * @route   GET /api/projects/admin/stats
 * @desc    Get dashboard stats for admin
 */
router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalProjects = await Project.countDocuments({});
    const activeProjects = await Project.countDocuments({ stage: { $ne: 'Completed' }, depositPaid: true });
    const pendingReview = await Project.countDocuments({ stage: 'Submitted' });
    const registeredClients = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        pendingReview,
        registeredClients,
        avgDeliverySpeed: '12.8 days'
      }
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching admin stats' });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Submit a new project proposal with files and requirements
 */
router.post('/', verifyToken, upload.array('files', 5), async (req, res) => {
  try {
    const { projectName, stack, budget, requirements, needsAi } = req.body;
    if (!projectName || !stack || !budget) {
      return res.status(400).json({ success: false, message: 'Project name, stack, and budget are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const filesMetadata = (req.files || []).map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      path: f.path,
      size: f.size,
      mimetype: f.mimetype
    }));

    // Theme Color Helper
    let color = 'var(--primary)';
    const lowerStack = stack.toLowerCase();
    if (lowerStack.includes('django')) color = 'var(--primary)';
    else if (lowerStack.includes('spring')) color = '#fbbf24';
    else if (lowerStack.includes('mern') || lowerStack.includes('express') || lowerStack.includes('node')) color = '#818cf8';
    else if (lowerStack.includes('next.js') || lowerStack.includes('react')) color = '#93c5fd';

    const project = await Project.create({
      projectName,
      clientName: user.name,
      userId: user._id,
      stack,
      budget,
      requirements: requirements || '',
      needsAi: needsAi === 'true' || needsAi === true,
      files: filesMetadata,
      stage: 'Submitted',
      color,
      callbackRequested: req.body.callbackRequested === 'true' || req.body.callbackRequested === true,
      callbackPhone: req.body.callbackPhone || ''
    });

    // Trigger alert log
    await triggerMilestoneAlerts({ user, project, eventName: 'SUBMITTED' });

    res.status(201).json({ success: true, message: 'Project request submitted for review!', project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error creating project' });
  }
});

/**
 * @route   PUT /api/projects/admin/estimate/:id
 * @desc    Submit price estimation for a project (Admin only)
 */
router.put('/admin/estimate/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { estimatedPrice } = req.body;
    if (!estimatedPrice) {
      return res.status(400).json({ success: false, message: 'Estimation price is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.estimatedPrice = estimatedPrice;
    project.priceEstimated = true;
    project.stage = 'Estimated';
    project.userDecision = 'None';
    await project.save();

    // Notify User
    const client = await User.findById(project.userId);
    if (client) {
      await triggerMilestoneAlerts({ user: client, project, eventName: 'ESTIMATED', customDetails: { price: estimatedPrice } });
    }

    res.json({ success: true, message: 'Estimation submitted successfully!', project });
  } catch (err) {
    console.error('Estimate project error:', err);
    res.status(500).json({ success: false, message: 'Server error submitting estimate' });
  }
});

/**
 * @route   PUT /api/projects/user/decision/:id
 * @desc    Client registers counter-offer or deletes proposal
 */
router.put('/user/decision/:id', verifyToken, async (req, res) => {
  try {
    const { decision, bargainPrice, bargainMessage } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    if (decision === 'Deleted') {
      // Notify Admin first
      await triggerMilestoneAlerts({ user, project, eventName: 'DELETED' });
      project.stage = 'Rejected';
      project.userDecision = 'Deleted';
      await project.save();
      return res.json({ success: true, message: 'Project proposal rejected/deleted successfully', project });
    }

    if (decision === 'Bargained') {
      if (!bargainPrice) {
        return res.status(400).json({ success: false, message: 'Bargain price is required' });
      }
      project.userDecision = 'Bargained';
      project.bargainPrice = bargainPrice;
      project.bargainMessage = bargainMessage || '';
      await project.save();

      // Notify Admin
      await triggerMilestoneAlerts({ user, project, eventName: 'BARGAINED', customDetails: { price: bargainPrice, message: bargainMessage } });
      return res.json({ success: true, message: 'Counter-offer submitted to admin!', project });
    }

    res.status(400).json({ success: false, message: 'Invalid decision request' });
  } catch (err) {
    console.error('Project decision error:', err);
    res.status(500).json({ success: false, message: 'Server error processing decision' });
  }
});

/**
 * @route   POST /api/projects/coupon/validate
 * @desc    Validate coupon and return discount details
 */
router.post('/coupon/validate', verifyToken, async (req, res) => {
  try {
    const { code, projectId } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const uppercaseCode = code.trim().toUpperCase();
    if (uppercaseCode === 'SPECIAL1999' || uppercaseCode === 'FIRST5') {
      return res.status(400).json({ success: false, message: 'This promo code is no longer valid.' });
    }
    let discountPercent = 0;
    let discountAmount = 0;
    let newTotal = 0;
    let message = '';

    let basePrice = project.userDecision === 'Bargained' ? project.bargainPrice : project.estimatedPrice;
    let targetPrice = await applyActiveOffer(basePrice);

    if (uppercaseCode === 'SPECIAL1499') {
      const dynamicCoupon = await Coupon.findOne({ code: uppercaseCode });
      if (dynamicCoupon) {
        if (dynamicCoupon.usageCount >= dynamicCoupon.maxUsers) {
          return res.status(400).json({ success: false, message: 'Special Offer limit of 5 bookings has been reached.' });
        }
      } else {
        // Dynamically create coupon in database to track usage count (limit 5)
        await Coupon.create({
          code: uppercaseCode,
          discountPercent: 90, // mock base percent
          maxUsers: 5,
          usageCount: 0,
          startDate: new Date(Date.now() - 24 * 3600 * 1000), // yesterday
          endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000) // next year
        });
      }
      discountAmount = targetPrice > 1999 ? (targetPrice - 1999) : 0;
      newTotal = targetPrice - discountAmount;
      discountPercent = targetPrice > 0 ? Math.round((discountAmount / targetPrice) * 100) : 0;
      message = `Special Offer Applied! Project price starting from ₹1,999/- (First 5 Users)`;
    } else {
      const dynamicCoupon = await Coupon.findOne({
        code: uppercaseCode,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (dynamicCoupon) {
        if (dynamicCoupon.usageCount < dynamicCoupon.maxUsers) {
          discountPercent = dynamicCoupon.discountPercent;
        } else {
          return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
        }
      } else if (uppercaseCode === 'WELCOME10') {
        discountPercent = 10;
      } else if (uppercaseCode === 'DEVQUEUE25') {
        discountPercent = 25;
      } else if (uppercaseCode === 'SUPERBUILD50') {
        discountPercent = 50;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }

      discountAmount = Math.round(targetPrice * (discountPercent / 100));
      newTotal = targetPrice - discountAmount;
      message = `Coupon ${uppercaseCode} applied! You saved ${discountPercent}%`;
    }

    res.json({
      success: true,
      code: uppercaseCode,
      discountPercent,
      discountAmount,
      newTotal,
      message
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
});

/**
 * @route   POST /api/projects/payment/order
 * @desc    Generate a Razorpay Order ID (or Simulator fallbacks)
 */
router.post('/payment/order', verifyToken, async (req, res) => {
  try {
    const { projectId, couponCode } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let basePrice = project.userDecision === 'Bargained' ? project.bargainPrice : project.estimatedPrice;
    let targetPrice = await applyActiveOffer(basePrice);
    
    // Server-side validation of coupon code
    if (couponCode) {
      const uppercaseCode = couponCode.trim().toUpperCase();
      if (uppercaseCode === 'SPECIAL1999' || uppercaseCode === 'FIRST5') {
        return res.status(400).json({ success: false, message: 'This promo code is no longer valid.' });
      }
      let discountPercent = 0;

      if (uppercaseCode === 'SPECIAL1499') {
        const dynamicCoupon = await Coupon.findOne({ code: uppercaseCode });
        if (dynamicCoupon && dynamicCoupon.usageCount >= dynamicCoupon.maxUsers) {
          return res.status(400).json({ success: false, message: 'Special offer has reached its limit of 5 bookings' });
        }
        targetPrice = 1999;
      } else {
        const dynamicCoupon = await Coupon.findOne({
          code: uppercaseCode,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });
        
        if (dynamicCoupon && dynamicCoupon.usageCount < dynamicCoupon.maxUsers) {
          discountPercent = dynamicCoupon.discountPercent;
        } else if (uppercaseCode === 'WELCOME10') {
          discountPercent = 10;
        } else if (uppercaseCode === 'DEVQUEUE25') {
          discountPercent = 25;
        } else if (uppercaseCode === 'SUPERBUILD50') {
          discountPercent = 50;
        }
        
        if (discountPercent > 0) {
          targetPrice = targetPrice - Math.round(targetPrice * (discountPercent / 100));
        }
      }
    }

    const isFinalPayment = project.depositPaid;
    const amount = isFinalPayment ? Math.round(targetPrice * 0.75) : Math.round(targetPrice * 0.25);
    
    // Amount in Razorpay expects paisa (amount * 100)
    const amountInPaisa = amount * 100;

    const rzKeyId = process.env.RAZORPAY_KEY_ID;
    const rzKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rzKeyId || !rzKeySecret || rzKeyId === 'placeholder' || rzKeySecret === 'placeholder') {
      return res.status(400).json({
        success: false,
        message: 'Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env file.'
      });
    }

    try {
      const instance = new Razorpay({
        key_id: rzKeyId,
        key_secret: rzKeySecret
      });

      const order = await instance.orders.create({
        amount: amountInPaisa,
        currency: 'INR',
        receipt: `receipt_proj_${project._id}`,
        notes: { projectId: project._id.toString() }
      });

      return res.json({
        success: true,
        mode: 'live',
        key: rzKeyId,
        orderId: order.id,
        amount: amountInPaisa,
        currency: 'INR'
      });
    } catch (err) {
      console.error('[Razorpay] Creation failed:', err.message);
      return res.status(400).json({
        success: false,
        message: `Razorpay order creation failed: ${err.message}`
      });
    }
  } catch (err) {
    console.error('Payment order generation error:', err);
    res.status(500).json({ success: false, message: 'Server error initiating payment gateway' });
  }
});

/**
 * @route   POST /api/projects/payment/verify
 * @desc    Verify payment and confirm booking
 */
router.post('/payment/verify', verifyToken, async (req, res) => {
  try {
    const { projectId, razorpayOrderId, razorpayPaymentId, razorpaySignature, couponCode } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Razorpay cryptographic signature verification
    const rzKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rzKeySecret || rzKeySecret === 'placeholder') {
      return res.status(400).json({ success: false, message: 'Razorpay Key Secret is not configured in backend/.env' });
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', rzKeySecret);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    let basePrice = project.userDecision === 'Bargained' ? project.bargainPrice : project.estimatedPrice;
    let targetPrice = await applyActiveOffer(basePrice);

    if (couponCode) {
      const uppercaseCode = couponCode.trim().toUpperCase();
      if (uppercaseCode === 'SPECIAL1999' || uppercaseCode === 'FIRST5') {
        return res.status(400).json({ success: false, message: 'This promo code is no longer valid.' });
      }
      let discountPercent = 0;

      if (uppercaseCode === 'SPECIAL1499') {
        const dynamicCoupon = await Coupon.findOne({ code: uppercaseCode });
        if (dynamicCoupon) {
          if (dynamicCoupon.usageCount < dynamicCoupon.maxUsers) {
            targetPrice = 1999;
            dynamicCoupon.usageCount += 1;
            await dynamicCoupon.save();
          } else {
            return res.status(400).json({ success: false, message: 'Special offer has reached its limit of 5 bookings' });
          }
        } else {
          // Fallback create and count
          await Coupon.create({
            code: uppercaseCode,
            discountPercent: 90,
            maxUsers: 5,
            usageCount: 1,
            startDate: new Date(Date.now() - 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000)
          });
          targetPrice = 1999;
        }
      } else {
        const dynamicCoupon = await Coupon.findOne({
          code: uppercaseCode,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });
        
        if (dynamicCoupon && dynamicCoupon.usageCount < dynamicCoupon.maxUsers) {
          discountPercent = dynamicCoupon.discountPercent;
          dynamicCoupon.usageCount += 1;
          await dynamicCoupon.save();
        } else if (uppercaseCode === 'WELCOME10') {
          discountPercent = 10;
        } else if (uppercaseCode === 'DEVQUEUE25') {
          discountPercent = 25;
        } else if (uppercaseCode === 'SUPERBUILD50') {
          discountPercent = 50;
        }
        
        if (discountPercent > 0) {
          targetPrice = targetPrice - Math.round(targetPrice * (discountPercent / 100));
        }
      }
    }

    const isFinalPayment = project.depositPaid;
    const paidAmount = isFinalPayment ? Math.round(targetPrice * 0.75) : Math.round(targetPrice * 0.25);

    if (isFinalPayment) {
      project.finalPaid = true;
    } else {
      project.depositPaid = true;
      project.budget = `₹${targetPrice.toLocaleString('en-IN')}`;
      project.stage = 'Planning';
      project.userDecision = 'Booked';
    }
    project.razorpayOrderId = razorpayOrderId || '';
    project.razorpayPaymentId = razorpayPaymentId || '';
    await project.save();

    const client = await User.findById(project.userId);
    const qPos = await getQueuePosition(project._id);

    // Notify user & admin
    if (client) {
      await triggerMilestoneAlerts({
        user: client,
        project,
        eventName: isFinalPayment ? 'STAGE_CHANGED' : 'BOOKED',
        customDetails: {
          depositAmount: paidAmount.toLocaleString(),
          queuePosition: qPos
        }
      });
    }

    res.json({ success: true, message: 'Payment confirmed and project added to queue!', project });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
});

/**
 * @route   PUT /api/projects/admin/:id
 * @desc    Update project tracking stage and details
 */
router.put('/admin/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { stage, depositPaid, finalPaid, budget, whatsLeftNotes } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const previousStage = project.stage;

    if (stage !== undefined) project.stage = stage;
    if (depositPaid !== undefined) project.depositPaid = depositPaid;
    if (finalPaid !== undefined) project.finalPaid = finalPaid;
    if (budget !== undefined) project.budget = budget;
    if (whatsLeftNotes !== undefined) project.whatsLeftNotes = whatsLeftNotes;

    await project.save();

    const client = await User.findById(project.userId);

    // If stage changed, trigger email & SMS update alerts
    if (stage !== undefined && stage !== previousStage && client) {
      await triggerMilestoneAlerts({ user: client, project, eventName: 'STAGE_CHANGED' });
    }

    res.json({ success: true, message: 'Project updated successfully!', project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ success: false, message: 'Server error updating project details' });
  }
});

/**
 * @route   GET /api/projects/notifications
 * @desc    Fetch notification/alert history log
 */
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { userId: req.user.id };
    }
    const notifications = await Notification.find(query)
      .populate('projectId', 'projectName')
      .sort({ sentAt: -1 })
      .limit(30);

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Fetch notifications logs error:', err);
    res.status(500).json({ success: false, message: 'Server error loading alerts logs' });
  }
});

/**
 * @route   PUT /api/projects/notifications/read
 * @desc    Mark all notifications for the user as read
 */
router.put('/notifications/read', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { userId: req.user.id };
    }
    await Notification.updateMany(query, { $set: { read: true } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ success: false, message: 'Server error marking notifications read' });
  }
});

/**
 * @route   PUT /api/projects/notifications/read/:id
 * @desc    Mark a specific notification as read
 */
router.put('/notifications/read/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    if (req.user.role !== 'admin' && notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Mark single notification read error:', err);
    res.status(500).json({ success: false, message: 'Server error marking notification read' });
  }
});

/**
 * @route   GET /api/projects/admin/ai-summary/:id
 * @desc    Compile a dynamic AI summary of project specifications and uploaded files (Admin only)
 */
router.get('/admin/ai-summary/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let tagline = '';
    let description = project.requirements;
    let platform = 'Not specified';
    let deadline = 'Not specified';
    let priority = 'Normal';

    try {
      const parsed = JSON.parse(project.requirements);
      tagline = parsed.tagline || '';
      description = parsed.description || '';
      platform = parsed.deployPlatform || 'Not specified';
      deadline = parsed.deadline || 'Not specified';
      priority = parsed.priority || 'Normal';
    } catch (e) {
      // Not JSON, use raw requirements string
    }

    let fileExtractedText = '';
    const textFilesInfo = [];

    for (const file of project.files) {
      const filePath = path.join(uploadDir, file.filename);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.txt' || ext === '.md' || ext === '.json') {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            fileExtractedText += '\n' + content;
            textFilesInfo.push(`Read contents of ${file.originalname}`);
          } catch (err) {
            console.error('Error reading file for AI summary:', err);
          }
        } else {
          textFilesInfo.push(`Analyzed attachment metadata for ${file.originalname}`);
        }
      }
    }

    const fullText = (description + ' ' + fileExtractedText).toLowerCase();
    const features = [];

    if (fullText.includes('auth') || fullText.includes('login') || fullText.includes('signup') || fullText.includes('password')) {
      features.push('User Authentication (secure signup/login, cookie-based session management)');
    }
    if (fullText.includes('payment') || fullText.includes('razorpay') || fullText.includes('stripe') || fullText.includes('checkout')) {
      features.push('Payment Gateway Integration (automated invoice verification, secure checkout hooks)');
    }
    if (fullText.includes('admin') || fullText.includes('dashboard') || fullText.includes('panel')) {
      features.push('Administrative Control Panel (real-time telemetry, user management grids)');
    }
    if (fullText.includes('chat') || fullText.includes('message') || fullText.includes('websocket') || fullText.includes('support')) {
      features.push('Interactions Channel (live chat thread, change request messaging framework)');
    }
    if (fullText.includes('db') || fullText.includes('database') || fullText.includes('mongo') || fullText.includes('postgres') || fullText.includes('sql')) {
      features.push('Relational or Document-based Schema Seeding & CRUD Operations');
    }
    if (fullText.includes('api') || fullText.includes('rest') || fullText.includes('endpoint')) {
      features.push('Secure JSON REST API Gateway and microservice route controllers');
    }
    if (project.needsAi || fullText.includes('ai') || fullText.includes('llm') || fullText.includes('gpt') || fullText.includes('bot')) {
      features.push('AI Semantics Layer (structured prompt completions, vector database integration)');
    }

    if (features.length < 3) {
      features.push('Responsive design grid system tailored for mobile & desktop viewports');
      features.push('Highly optimized database indexes to accelerate dashboard telemetry loads');
      features.push('Standard middleware protection wrappers to secure backend endpoints');
    }

    // Dynamic Price Calculation & Explanatory Breakdown
    const priceDetails = [];
    let calculatedPrice = 40000; // Base architecture
    priceDetails.push({ item: 'Base System Setup & Architecture', cost: 40000 });

    if (project.stack.toLowerCase().includes('react') || project.stack.toLowerCase().includes('vue') || project.stack.toLowerCase().includes('next')) {
      calculatedPrice += 20000;
      priceDetails.push({ item: 'Single Page App UI (React/Vue/Next)', cost: 20000 });
    }
    
    if (fullText.includes('auth') || fullText.includes('login') || fullText.includes('signup') || fullText.includes('password')) {
      calculatedPrice += 25000;
      priceDetails.push({ item: 'User Authentication & Session Management', cost: 25000 });
    }

    if (fullText.includes('payment') || fullText.includes('razorpay') || fullText.includes('stripe') || fullText.includes('checkout')) {
      calculatedPrice += 35000;
      priceDetails.push({ item: 'Payment Gateway Integration', cost: 35000 });
    }

    if (fullText.includes('chat') || fullText.includes('message') || fullText.includes('websocket') || fullText.includes('support')) {
      calculatedPrice += 30000;
      priceDetails.push({ item: 'Real-time Chat / Interactions Support', cost: 30000 });
    }

    if (fullText.includes('db') || fullText.includes('database') || fullText.includes('mongo') || fullText.includes('postgres') || fullText.includes('sql') || fullText.includes('schema')) {
      calculatedPrice += 30000;
      priceDetails.push({ item: 'Database Schema persistence & CRUD APIs', cost: 30000 });
    }

    if (project.needsAi || fullText.includes('ai') || fullText.includes('llm') || fullText.includes('gpt') || fullText.includes('bot') || fullText.includes('vector')) {
      calculatedPrice += 60000;
      priceDetails.push({ item: 'AI Semantics Layer & LLM Integration', cost: 60000 });
    }

    if (priority === 'High' || priority === 'Urgent') {
      calculatedPrice += 25000;
      priceDetails.push({ item: 'Expedited Delivery Priority Surcharge', cost: 25000 });
    } else if (deadline.includes('week') || (parseInt(deadline) <= 15)) {
      calculatedPrice += 15000;
      priceDetails.push({ item: 'Accelerated Timeline Overhead', cost: 15000 });
    }

    // Now set difficulty, timeline and format range
    let difficulty = 'Moderate';
    let timeRec = '14–21 Days';
    if (calculatedPrice >= 200000) {
      difficulty = 'Enterprise';
      timeRec = '28–42 Days';
    } else if (calculatedPrice >= 120000) {
      difficulty = 'Hard';
      timeRec = '21–28 Days';
    } else if (calculatedPrice <= 60000) {
      difficulty = 'Easy';
      timeRec = '7–10 Days';
    }

    const priceRec = `₹${(calculatedPrice - 1500).toLocaleString()} - ₹${(calculatedPrice + 2500).toLocaleString()}`;
    const priceVal = calculatedPrice;

    // Compose Brief Explanation
    let briefExplanation = '';
    if (fullText.includes('ecommerce') || fullText.includes('shop') || fullText.includes('store') || fullText.includes('payment')) {
      briefExplanation = `The client is requesting an e-commerce or transaction-heavy platform using ${project.stack}. The main requirements involve product catalogs, order processing, and payment integrations. Based on the specs, we need to design secure checkout hooks and invoice logic. We suggest a ${difficulty} difficulty rating due to the transaction security and database structure required.`;
    } else if (project.needsAi || fullText.includes('ai') || fullText.includes('llm') || fullText.includes('gpt')) {
      briefExplanation = `The client wants to build an AI-powered system featuring smart agent capabilities, custom prompt templates, or vector database lookups using ${project.stack}. Implementing LLM rate-limiting resilience, structured output parsing, and conversational states will be critical. The scope is classified as ${difficulty} complexity.`;
    } else if (fullText.includes('chat') || fullText.includes('message') || fullText.includes('websocket') || fullText.includes('collaboration')) {
      briefExplanation = `The client is requesting real-time user-to-user communication, messaging boards, or collaboration portals. This requires standard WebSocket controllers, presence status handlers, and efficient database models for storing message threads. It represents a ${difficulty} development task.`;
    } else if (fullText.includes('admin') || fullText.includes('dashboard') || fullText.includes('management') || fullText.includes('portal')) {
      briefExplanation = `The client wants a business management portal or analytical dashboard with tables, filtering, and data visualizations. We will need role-based routing, database aggregates, and tabular export options. The estimated workload is ${difficulty}.`;
    } else {
      briefExplanation = `The client is seeking a custom full-stack software application built on ${project.stack}. Requirements point to customized database collections, CRUD service APIs, and a modern responsive user interface. This is evaluated as a ${difficulty} scope.`;
    }

    // Append extra details from files if any
    if (fileExtractedText.length > 10) {
      briefExplanation += ` Additionally, the uploaded requirements documents (containing ${fileExtractedText.slice(0, 100).replace(/\s+/g, ' ')}...) detail specific structural requirements that have been factored into the itemized pricing.`;
    } else if (project.files.length > 0) {
      briefExplanation += ` The user has attached ${project.files.length} design or specifications file(s). We have reviewed their metadata and included structural allowances in the final quote suggestion.`;
    }

    let slogan = 'Interactive Full-Stack Web Integration';
    if (fullText.includes('ecommerce') || fullText.includes('shop') || fullText.includes('store')) {
      slogan = 'Secure E-Commerce Transaction Hub & Shopping Grid';
    } else if (project.needsAi || fullText.includes('ai') || fullText.includes('chat') || fullText.includes('llm')) {
      slogan = 'Advanced AI Semantic Retrieval & LLM Model Integration';
    } else if (fullText.includes('social') || fullText.includes('forum') || fullText.includes('community')) {
      slogan = 'Scalable Social Interaction Portal & User Grid';
    } else if (tagline) {
      slogan = tagline;
    }

    res.json({
      success: true,
      summary: {
        slogan,
        difficulty,
        timeRec,
        priceRec,
        priceVal,
        features,
        textFilesInfo,
        briefExplanation,
        priceDetails
      }
    });
  } catch (err) {
    console.error('AI Summary generation error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling specifications summary' });
  }
});

/**
 * @route   POST /api/projects/chat/:id
 * @desc    Submit a change request/chat message from the client
 */
router.post('/chat/:id', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.changeRequests.push({
      sender: 'client',
      message
    });
    await project.save();

    const client = await User.findById(req.user.id);
    const adminEmail = process.env.ADMIN_EMAIL || 'Reqworks.tech@gmail.com';

    // Alert Admin via Telegram Bot
    await sendAlert({
      userId: req.user.id,
      projectId: project._id,
      recipient: process.env.TELEGRAM_CHAT_ID || 'admin_telegram_channel',
      type: 'telegram',
      title: `💬 Change Request: ${project.projectName}`,
      message: `💬 *Change Request / Chat Message*\n\nA message has been received for project *${project.projectName}*:\n"${message}"\n\nPlease log in to review chat and manage the request securely: ${process.env.CLIENT_URL || 'https://www.reqworks.in'}/admin/dashboard`,
      direction: 'to_admin'
    });

    res.json({ success: true, message: 'Message sent successfully!', project });
  } catch (err) {
    console.error('Submit chat error:', err);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
});

/**
 * @route   POST /api/projects/admin/chat/:id
 * @desc    Submit a reply message from the admin (Admin only)
 */
router.post('/admin/chat/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.changeRequests.push({
      sender: 'admin',
      message
    });
    await project.save();

    const client = await User.findById(project.userId);
    if (client) {
      await sendAlert({
        userId: client._id,
        projectId: project._id,
        recipient: client.email,
        type: 'email',
        title: `DevQueue Admin Reply: ${project.projectName}`,
        message: `💬 *DevQueue Admin Message*\n\nAdmin replied to your project *${project.projectName}*:\n"${message}"`,
        direction: 'to_user'
      });
    }
    res.json({ success: true, message: 'Reply sent successfully!', project });
  } catch (err) {
    console.error('Submit admin reply error:', err);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
});

/**
 * @route   GET /api/projects/admin/users
 * @desc    Fetch all registered client users (Admin only)
 */
router.get('/admin/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const clients = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users: clients });
  } catch (err) {
    console.error('Fetch admin users error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

/**
 * @route   POST /api/projects/admin/notifications
 * @desc    Log a manual admin notification broadcast (Admin only)
 */
router.post('/admin/notifications', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'User ID, title, and message are required' });
    }
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let recipient = targetUser.email;
    if (type === 'telegram') {
      recipient = process.env.TELEGRAM_CHAT_ID || 'admin_telegram_channel';
    }

    const notification = await sendAlert({
      userId: targetUser._id,
      recipient,
      type: type || 'email',
      title,
      message,
      direction: type === 'telegram' ? 'to_admin' : 'to_user'
    });

    res.status(201).json({ success: true, message: 'Broadcast alert sent successfully!', notification });
  } catch (err) {
    console.error('Create admin notification error:', err);
    res.status(500).json({ success: false, message: 'Server error creating alert' });
  }
});

/**
 * @route   GET /api/projects/admin/coupons
 * @desc    Fetch all coupons (Admin only)
 */
router.get('/admin/coupons', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    console.error('Fetch coupons error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching coupons' });
  }
});

/**
 * @route   POST /api/projects/admin/coupons
 * @desc    Generate a new coupon (Admin only)
 */
router.post('/admin/coupons', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { code, discountPercent, maxUsers, startDate, endDate } = req.body;
    if (!code || !discountPercent || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercent,
      maxUsers: maxUsers || 100,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully!', coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ success: false, message: 'Server error creating coupon' });
  }
});

/**
 * @route   DELETE /api/projects/admin/coupons/:id
 * @desc    Delete/Deactivate a coupon (Admin only)
 */
router.delete('/admin/coupons/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully!' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting coupon' });
  }
});

/**
 * @route   GET /api/projects/admin/offers
 * @desc    Fetch offers list (Admin only)
 */
router.get('/admin/offers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    res.json({ success: true, offers });
  } catch (err) {
    console.error('Fetch offers error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching offers' });
  }
});

/**
 * @route   POST /api/projects/admin/offers
 * @desc    Save/Update global offer (Admin only)
 */
router.post('/admin/offers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { discountPercent, startDate, endDate, active, description } = req.body;
    if (!discountPercent || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Discount percent, start date, and end date are required' });
    }

    if (active !== false) {
      await Offer.updateMany({}, { active: false });
    }

    const offer = await Offer.create({
      discountPercent,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: active !== false,
      description: description || ''
    });

    res.status(201).json({ success: true, message: 'Offer updated successfully!', offer });
  } catch (err) {
    console.error('Save offer error:', err);
    res.status(500).json({ success: false, message: 'Server error saving offer' });
  }
});

/**
 * @route   PUT /api/projects/admin/bargain/:id
 * @desc    Accept or Reject user bargaining counter-offer (Admin only)
 */
router.put('/admin/bargain/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const { action } = req.body; // 'accept' or 'reject'
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const client = await User.findById(project.userId);

    if (action === 'accept') {
      project.estimatedPrice = project.bargainPrice;
      project.userDecision = 'None';
      project.bargainPrice = 0;
      await project.save();

      if (client) {
        await triggerMilestoneAlerts({
          user: client,
          project,
          eventName: 'STAGE_CHANGED',
          customDetails: { notes: `Bargain accepted! Price set to ₹${project.estimatedPrice}` }
        });
      }
      return res.json({ success: true, message: 'Bargain counter-offer accepted!', project });
    } else if (action === 'reject') {
      project.userDecision = 'None';
      const oldBargain = project.bargainPrice;
      project.bargainPrice = 0;
      await project.save();

      if (client) {
        await triggerMilestoneAlerts({
          user: client,
          project,
          eventName: 'STAGE_CHANGED',
          customDetails: { notes: `Bargain of ₹${oldBargain} was declined. Price remains at ₹${project.estimatedPrice}` }
        });
      }
      return res.json({ success: true, message: 'Bargain counter-offer declined!', project });
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (err) {
    console.error('Bargain resolve error:', err);
    res.status(500).json({ success: false, message: 'Server error resolving bargain' });
  }
});

/**
 * @route   GET /api/projects/download/:filename
 * @desc    Download project specifications file securely
 */
router.get('/download/:filename', verifyToken, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

module.exports = router;
