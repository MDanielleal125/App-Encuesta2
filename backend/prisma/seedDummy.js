const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { mapScoreToPoints } = require('../src/utils/scoring');

const prisma = new PrismaClient();

async function main(count = 500) {
  console.log(`Creando ${count} usuarios de prueba con encuestas...`);

  // asegurar que haya preguntas en la base
  const questions = await prisma.question.findMany({ where: { active: true } });
  if (!questions.length) {
    throw new Error('No hay preguntas activas en la base de datos. Ejecuta primero el seed básico.');
  }

  for (let i = 0; i < count; i += 1) {
    const cedula = `tmp${String(i).padStart(6, '0')}`; // debe ser único
    const name = `Usuario ${i}`;
    const passwordHash = await bcrypt.hash('pass1234', 10);

    const user = await prisma.user.create({
      data: { name, cedula, passwordHash },
    });

    // crear encuesta vinculada al usuario
    const survey = await prisma.survey.create({ data: { userId: user.id } });

    // generar respuestas aleatorias y acumular totales por perfil
    const totals = {
      totalProfileA: 0,
      totalProfileB: 0,
      totalProfileC: 0,
      totalProfileD: 0,
    };

    const answers = questions.map((q) => {
      const rawScore = Math.floor(Math.random() * 10) + 1; // 1..10
      const points = mapScoreToPoints(rawScore);
      totals[`totalProfile${q.profile}`] += points;
      return {
        surveyId: survey.id,
        questionId: q.id,
        rawScore,
        points,
      };
    });

    // insertar respuestas y actualizar totales de la encuesta
    await prisma.answer.createMany({ data: answers });
    await prisma.survey.update({
      where: { id: survey.id },
      data: totals,
    });

    if ((i + 1) % 50 === 0) {
      console.log(`${i + 1} usuarios generados...`);
    }
  }

  console.log(`Terminó la generación de ${count} encuestas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
