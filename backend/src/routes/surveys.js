const express = require('express');
const prisma = require('../prisma');
const { authenticateToken } = require('../middleware/auth');
const { mapScoreToPoints } = require('../utils/scoring');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Debe enviar las respuestas de la encuesta' });
    }

    const questionIds = [...new Set(answers.map((a) => a.questionId))];

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionsById = new Map(questions.map((q) => [q.id, q]));

    let totalProfileA = 0;
    let totalProfileB = 0;
    let totalProfileC = 0;
    let totalProfileD = 0;

    const answerRecords = answers.map((answer) => {
      const question = questionsById.get(answer.questionId);
      if (!question) {
        throw new Error(`Pregunta no encontrada: ${answer.questionId}`);
      }

      const rawScore = Number(answer.value);
      const points = mapScoreToPoints(rawScore);

      if (!question.isExample) {
        switch (question.profile) {
          case 'A':
            totalProfileA += points;
            break;
          case 'B':
            totalProfileB += points;
            break;
          case 'C':
            totalProfileC += points;
            break;
          case 'D':
            totalProfileD += points;
            break;
          default:
            break;
        }
      }

      return {
        questionId: question.id,
        rawScore,
        points,
      };
    });

    const survey = await prisma.survey.create({
      data: {
        userId: req.user.userId,
        totalProfileA,
        totalProfileB,
        totalProfileC,
        totalProfileD,
        answers: {
          create: answerRecords,
        },
      },
    });

    return res.status(201).json({
      id: survey.id,
      message: 'Encuesta guardada correctamente',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error guardando la encuesta' });
  }
});

module.exports = router;

