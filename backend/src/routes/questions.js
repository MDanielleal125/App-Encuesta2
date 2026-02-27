const express = require('express');
const prisma = require('../prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Preguntas visibles para el usuario común (sin mostrar el perfil asociado)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    const publicQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      order: q.order,
      isExample: q.isExample,
    }));

    return res.json(publicQuestions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo preguntas' });
  }
});

module.exports = router;

