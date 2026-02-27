const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Insertando usuario administrador y preguntas de ejemplo...');

  const adminCedula = '00000000';
  const existingAdmin = await prisma.user.findUnique({
    where: { cedula: adminCedula },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        cedula: adminCedula,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Usuario administrador creado (cédula 00000000, contraseña admin123).');
  } else {
    console.log('Usuario administrador ya existe, no se crea uno nuevo.');
  }

  const existingQuestions = await prisma.question.count();
  if (existingQuestions > 0) {
    console.log(`Ya existen ${existingQuestions} preguntas, no se reemplazan.`);
    return;
  }

  const profiles = ['A', 'B', 'C', 'D'];

  const questions = [];

  questions.push({
    text: 'EJEMPLO: Marca un número del 1 al 10 según qué tanto te identificas con esta afirmación.',
    profile: 'A',
    order: 1,
    isExample: true,
    active: true,
  });

  const baseTexts = [
    'Me gusta proponer ideas nuevas y diferentes para los proyectos.',
    'Disfruto analizando los detalles antes de tomar una decisión.',
    'Me siento cómodo llevando una idea a un plan concreto de trabajo.',
    'Me motiva ejecutar tareas y ver resultados tangibles rápidamente.',
    'Suelo imaginar nuevas formas de mejorar productos o procesos.',
    'Prefiero revisar la información disponible antes de avanzar.',
    'Me gusta organizar los pasos necesarios para lograr un objetivo.',
    'Disfruto coordinando la implementación de soluciones en el día a día.',
    'Me entusiasma explorar posibilidades aunque aún no estén claras.',
    'Valoro tener datos y evidencias para respaldar las decisiones.',
    'Me resulta natural convertir una idea general en un plan detallado.',
    'Me concentro en completar las tareas asignadas de forma eficiente.',
    'Suelo proponer cambios creativos en mi entorno de trabajo.',
    'Me detengo a aclarar dudas y hacer preguntas antes de actuar.',
    'Me gusta estructurar proyectos y definir responsables y plazos.',
    'Me enfoco en que las cosas se hagan y se cumplan los compromisos.',
    'Me atrae pensar en el futuro y en nuevas oportunidades.',
    'Disfruto profundizar en la información para entenderla a fondo.',
    'Me motiva diseñar procesos claros y ordenados.',
    'Suelo tomar la iniciativa para poner en marcha las decisiones.',
    'Me entusiasma participar en sesiones de lluvia de ideas.',
    'Tengo facilidad para detectar inconsistencias o riesgos.',
    'Disfruto descomponer problemas grandes en tareas manejables.',
    'Me siento satisfecho cuando un proyecto se implementa en producción.',
    'Me gusta imaginar alternativas diferentes a lo ya establecido.',
    'Suelo revisar y validar la información antes de compartirla.',
    'Me interesa definir métodos de trabajo y estándares.',
    'Me enfoco en cumplir los plazos y objetivos definidos.',
    'Tiendo a cuestionar el statu quo y buscar innovar.',
    'Me gusta clarificar objetivos y criterios de éxito.',
    'Disfruto planificar recursos y coordinar esfuerzos.',
    'Me motiva supervisar la ejecución y el seguimiento de planes.',
    'Suelo conectar ideas aparentemente no relacionadas.',
    'Valoro tener instrucciones precisas y bien definidas.',
    'Me resulta natural documentar planes y procesos.',
    'Me oriento a resolver problemas operativos rápidamente.',
    'Busco equilibrar creatividad y análisis en mi trabajo.',
  ];

  let order = 2;
  for (let i = 0; i < baseTexts.length; i += 1) {
    const profile = profiles[(i + 1) % profiles.length];
    questions.push({
      text: baseTexts[i],
      profile,
      order,
      isExample: false,
      active: true,
    });
    order += 1;
  }

  if (questions.length !== 37) {
    console.warn(`Advertencia: se esperaban 37 preguntas, se generaron ${questions.length}.`);
  }

  await prisma.question.createMany({
    data: questions,
  });

  console.log(`Se crearon ${questions.length} preguntas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

