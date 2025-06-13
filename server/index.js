const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatapp';

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connecté à MongoDB');
}).catch((error) => {
  console.error('❌ Erreur MongoDB:', error);
  process.exit(1);
});

// Schémas MongoDB
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
 const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Message = mongoose.model('Message', messageSchema);
// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Fonction pour générer un code de salle unique
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifications
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Utilisateur ou email déjà existant' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifications
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }


    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Routes des salles
app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Nom de salle requis' });
    }

    // Générer un code unique
    let code;
    let existingRoom;
    do {
      code = generateRoomCode();
      existingRoom = await Room.findOne({ code });
    } while (existingRoom);

    // Créer la salle
    const room = new Room({
      name,
      code,
      createdBy: userId,
      members: [userId],
    });

    await room.save();

    res.status(201).json({
      message: 'Salle créée avec succès',
      room: {
        id: room._id,
        name: room.name,
        code: room.code,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur création salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/rooms/join', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId;

    if (!code) {
      return res.status(400).json({ message: 'Code de salle requis' });
    }
    // Trouver la salle
    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    // Vérifier si l'utilisateur est déjà membre
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json({
      message: 'Salle rejointe avec succès',
      room: {
        id: room._id,
        name: room.name,
        code: room.code,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur rejoindre salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rooms/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Vérifier que l'utilisateur demande ses propres salles
    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const rooms = await Room.find({ members: userId })
      .populate('createdBy', 'username')
      .sort({ lastActivity: -1 });

    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const messagesCount = await Message.countDocuments({ roomId: room._id });
        return {
          id: room._id,
          name: room.name,
          code: room.code,
          membersCount: room.members.length,
          lastActivity: room.lastActivity,
          unreadCount: 0, // À implémenter selon vos besoins
          createdAt: room.createdAt,
        };
      })
    );

    res.json({ rooms: roomsWithStats });
  } catch (error) {
    console.error('Erreur récupération salles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
     // Vérifier que l'utilisateur est membre de la salle
    if (!room.members.includes(userId)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({
      room: {
        id: room._id,
        name: room.name,
        code: room.code,
        membersCount: room.members.length,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur récupération salle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    
