const express = require('express');
const multer = require('multer');
const prisma = require('../prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken, requireAdmin);

router.get('/surveys', async (req, res) => {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cedula: true,
          },
        },
      },
    });

    const mapped = surveys.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      user: s.user,
      totals: {
        A: s.totalProfileA,
        B: s.totalProfileB,
        C: s.totalProfileC,
        D: s.totalProfileD,
      },
    }));

    return res.json(mapped);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo encuestas' });
  }
});

router.get('/surveys/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, cedula: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Encuesta no encontrada' });
    }

    return res.json(survey);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo la encuesta' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const aggregate = await prisma.survey.aggregate({
      _sum: {
        totalProfileA: true,
        totalProfileB: true,
        totalProfileC: true,
        totalProfileD: true,
      },
      _count: {
        id: true,
      },
    });

    return res.json({
      totalSurveys: aggregate._count.id,
      profiles: {
        A: aggregate._sum.totalProfileA || 0,
        B: aggregate._sum.totalProfileB || 0,
        C: aggregate._sum.totalProfileC || 0,
        D: aggregate._sum.totalProfileD || 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo resumen' });
  }
});

router.get('/questions', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
    });
    return res.json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo preguntas' });
  }
});

router.get('/import-stats', async (req, res) => {
  try {
    const [questionCount, answerCount] = await Promise.all([
      prisma.question.count(),
      prisma.answer.count(),
    ]);
    return res.json({ questionCount, answerCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

router.post('/questions/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Debe adjuntar un archivo' });
    }

    let content = req.file.buffer.toString('utf-8');
    const isJson = req.file.originalname.toLowerCase().endsWith('.json');

    if (!isJson && /totalProfileA|createdAt|userName|cedula/.test(content)) {
      return res.status(400).json({
        message: 'Parece un archivo de resultados, no de preguntas. Para importar preguntas use un CSV con columnas: text, profile, order, isExample, active.',
      });
    }

    let records;

    if (isJson) {
      try {
        records = JSON.parse(content);
      } catch (e) {
        return res.status(400).json({ message: 'El archivo JSON no es válido.' });
      }
    } else {
      content = content.replace(/^\uFEFF/, '');
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        return res.status(400).json({ message: 'CSV vacío o sin datos' });
      }

      const parseCsvLine = (line, sep) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            inQuotes = !inQuotes;
          } else if (c === sep && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += c;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headerLine = lines[0];
      const separator = headerLine.includes(';') ? ';' : ',';
      const headers = parseCsvLine(headerLine, separator).map((h) => h.replace(/^"|"$/g, '').trim());
      const hasQuestionColumn = headers.some((h) => /^text$|^pregunta$/i.test(h));
      if (!hasQuestionColumn) {
        return res.status(400).json({
          message: 'El CSV debe tener una columna "text" o "pregunta". Columnas encontradas: ' + headers.join(', ') + '.',
        });
      }

      records = lines.slice(1).map((line) => {
        const values = parseCsvLine(line, separator).map((v) => v.replace(/^"|"$/g, '').trim());
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        return obj;
      });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No hay filas de datos en el archivo' });
    }

    const data = records.map((r, index) => {
      const text = (r.text || r.pregunta || '').trim();
      const profile = String(r.profile || r.perfil || 'A').toUpperCase().trim();
      const validProfile = ['A', 'B', 'C', 'D'].includes(profile) ? profile : 'A';
      return {
        text: text || `Pregunta ${index + 1}`,
        profile: validProfile,
        order: r.order !== undefined && r.order !== '' ? Number(r.order) : index + 1,
        isExample:
          typeof r.isExample === 'boolean'
            ? r.isExample
            : String(r.isExample || '').toLowerCase() === 'true' || String(r.isExample || '').toLowerCase() === '1',
        active:
          typeof r.active === 'boolean'
            ? r.active
            : String(r.active || 'true').toLowerCase() !== 'false' && String(r.active || '').toLowerCase() !== '0',
      };
    });

    await prisma.$transaction([
      prisma.answer.deleteMany({}),
      prisma.question.deleteMany({}),
      prisma.question.createMany({ data }),
    ]);

    return res.json({ message: 'Preguntas importadas correctamente', count: data.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Error importando preguntas' });
  }
});

router.get('/questions/export', async (req, res) => {
  try {
    const format = (req.query.format || 'json').toString().toLowerCase();

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
    });

    if (format === 'csv') {
      const header = 'id,text,profile,order,isExample,active';
      const lines = questions.map(
        (q) =>
          [
            q.id,
            `"${(q.text || '').replace(/"/g, '""')}"`,
            q.profile,
            q.order,
            q.isExample,
            q.active,
          ].join(','),
      );
      const csv = [header, ...lines].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=\"questions.csv\"');
      return res.send(csv);
    }

    return res.json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error exportando preguntas' });
  }
});

router.get('/results/export', async (req, res) => {
  try {
    const format = (req.query.format || 'json').toString().toLowerCase();

    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });

    const rows = surveys.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      userName: s.user?.name || '',
      cedula: s.user?.cedula || '',
      totalProfileA: s.totalProfileA,
      totalProfileB: s.totalProfileB,
      totalProfileC: s.totalProfileC,
      totalProfileD: s.totalProfileD,
    }));

    if (format === 'csv') {
      const header = 'id,createdAt,userName,cedula,totalProfileA,totalProfileB,totalProfileC,totalProfileD';
      const lines = rows.map((r) =>
        [
          r.id,
          r.createdAt.toISOString(),
          `"${(r.userName || '').replace(/"/g, '""')}"`,
          `"${(r.cedula || '').replace(/"/g, '""')}"`,
          r.totalProfileA,
          r.totalProfileB,
          r.totalProfileC,
          r.totalProfileD,
        ].join(','),
      );
      const csv = [header, ...lines].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=\"results.csv\"');
      return res.send(csv);
    }

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error exportando resultados' });
  }
});
// Crear pregunta manualmente
router.post('/questions', async (req, res) => {
  try {
    const { text, profile, order, isExample, active } = req.body;
    if (!text || !profile) {
      return res.status(400).json({ message: 'text y profile son obligatorios' });
    }
    const validProfile = ['A', 'B', 'C', 'D'].includes(profile.toUpperCase()) ? profile.toUpperCase() : 'A';
    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        profile: validProfile,
        order: order ? Number(order) : 999,
        isExample: isExample === true || isExample === 'true',
        active: active === false || active === 'false' ? false : true,
      },
    });
    return res.json(question);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creando pregunta' });
  }
});

// Eliminar pregunta
router.delete('/questions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.answer.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });
    return res.json({ message: 'Pregunta eliminada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error eliminando pregunta' });
  }
});
// Editar pregunta
router.put('/questions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { text, profile, order, isExample, active } = req.body;
    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(profile !== undefined && { profile: profile.toUpperCase() }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isExample !== undefined && { isExample: isExample === true || isExample === 'true' }),
        ...(active !== undefined && { active: active === true || active === 'true' }),
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error editando pregunta' });
  }
});
module.exports = router;

