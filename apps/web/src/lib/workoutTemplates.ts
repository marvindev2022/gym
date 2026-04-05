// Base de dados de treinos pré-cadastrados

export const DIVISOES = ['Treino A', 'Treino B', 'Treino C', 'Treino D', 'Treino E', 'Full Body', 'Upper', 'Lower', 'Push', 'Pull', 'Legs']

export const OBJETIVOS = ['Hipertrofia', 'Força', 'Resistência', 'Emagrecimento', 'Condicionamento', 'Reabilitação']

export const GRUPOS_MUSCULARES = [
  'Peito e Tríceps',
  'Costas e Bíceps',
  'Pernas',
  'Ombro',
  'Braços',
  'Core / Abdômen',
  'Glúteos',
  'Posterior de Coxa',
  'Quadríceps',
  'Panturrilha',
  'Full Body',
  'Funcional',
  'HIIT',
  'Cardio',
  'Mobilidade',
]

// Exercícios pré-cadastrados por grupo muscular
export const EXERCICIOS_POR_GRUPO: Record<string, { name: string; sets: number; reps: string; rest_seconds: number; notes?: string }[]> = {
  'Peito e Tríceps': [
    { name: 'Supino reto', sets: 4, reps: '10-12', rest_seconds: 90, notes: 'Desça até tocar o peito levemente' },
    { name: 'Supino inclinado', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Crucifixo reto', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Cross over alto', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'Cotovelo levemente flexionado' },
    { name: 'Tríceps corda', sets: 4, reps: '12-15', rest_seconds: 60, notes: 'Mantenha os cotovelos fixos' },
    { name: 'Tríceps testa', sets: 3, reps: '10-12', rest_seconds: 60 },
  ],
  'Costas e Bíceps': [
    { name: 'Puxada frente', sets: 4, reps: '10-12', rest_seconds: 90, notes: 'Puxe até o queixo' },
    { name: 'Remada curvada', sets: 4, reps: '10-12', rest_seconds: 90 },
    { name: 'Remada baixa', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Pullover', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Rosca direta', sets: 3, reps: '10-12', rest_seconds: 60, notes: 'Cotovelos fixos ao corpo' },
    { name: 'Rosca alternada', sets: 3, reps: '10-12', rest_seconds: 60 },
  ],
  'Pernas': [
    { name: 'Agachamento livre', sets: 4, reps: '10-12', rest_seconds: 120, notes: 'Desça até 90° ou abaixo' },
    { name: 'Leg press', sets: 4, reps: '12-15', rest_seconds: 90 },
    { name: 'Cadeira extensora', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'Segure 1s no topo' },
    { name: 'Mesa flexora', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Stiff', sets: 3, reps: '10-12', rest_seconds: 90, notes: 'Sinta o alongamento do isquiotibial' },
    { name: 'Panturrilha em pé', sets: 4, reps: '15-20', rest_seconds: 45 },
  ],
  'Ombro': [
    { name: 'Desenvolvimento com halter', sets: 4, reps: '10-12', rest_seconds: 90 },
    { name: 'Elevação lateral', sets: 4, reps: '12-15', rest_seconds: 60, notes: 'Cotovelo levemente flexionado' },
    { name: 'Elevação frontal', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Face pull', sets: 3, reps: '15', rest_seconds: 60, notes: 'Puxe até a altura do rosto' },
    { name: 'Crucifixo invertido', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Remada alta', sets: 3, reps: '12', rest_seconds: 60 },
  ],
  'Braços': [
    { name: 'Rosca direta', sets: 4, reps: '10-12', rest_seconds: 60 },
    { name: 'Rosca martelo', sets: 3, reps: '10-12', rest_seconds: 60 },
    { name: 'Rosca concentrada', sets: 3, reps: '12-15', rest_seconds: 60 },
    { name: 'Tríceps corda', sets: 4, reps: '12-15', rest_seconds: 60 },
    { name: 'Tríceps francês', sets: 3, reps: '10-12', rest_seconds: 60 },
    { name: 'Tríceps banco', sets: 3, reps: '12-15', rest_seconds: 60 },
  ],
  'Core / Abdômen': [
    { name: 'Prancha', sets: 3, reps: '30-60s', rest_seconds: 45, notes: 'Mantenha o corpo reto' },
    { name: 'Abdominal reto', sets: 3, reps: '15-20', rest_seconds: 45 },
    { name: 'Elevação de pernas', sets: 3, reps: '15', rest_seconds: 45 },
    { name: 'Russian twist', sets: 3, reps: '20', rest_seconds: 45 },
    { name: 'Prancha lateral', sets: 3, reps: '30s', rest_seconds: 30 },
    { name: 'Hollow hold', sets: 3, reps: '20-30s', rest_seconds: 45 },
  ],
  'Glúteos': [
    { name: 'Hip thrust', sets: 4, reps: '12-15', rest_seconds: 90, notes: 'Contraia no topo' },
    { name: 'Elevação pélvica', sets: 3, reps: '15', rest_seconds: 60 },
    { name: 'Afundo', sets: 4, reps: '12 cada', rest_seconds: 60 },
    { name: 'Step-up', sets: 3, reps: '12 cada', rest_seconds: 60 },
    { name: 'Abdução de quadril', sets: 3, reps: '15-20', rest_seconds: 45 },
    { name: 'Glute bridge', sets: 3, reps: '15', rest_seconds: 60 },
  ],
  'Full Body': [
    { name: 'Agachamento livre', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Supino reto', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Remada curvada', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Desenvolvimento com halter', sets: 3, reps: '10-12', rest_seconds: 90 },
    { name: 'Rosca direta', sets: 3, reps: '10-12', rest_seconds: 60 },
    { name: 'Tríceps corda', sets: 3, reps: '10-12', rest_seconds: 60 },
    { name: 'Prancha', sets: 3, reps: '30-45s', rest_seconds: 45 },
  ],
  'Funcional': [
    { name: 'Burpee', sets: 4, reps: '10', rest_seconds: 60 },
    { name: 'Mountain climber', sets: 3, reps: '20', rest_seconds: 45 },
    { name: 'Kettlebell swing', sets: 4, reps: '15', rest_seconds: 60 },
    { name: 'Box jump', sets: 4, reps: '8-10', rest_seconds: 90 },
    { name: 'Farmer walk', sets: 3, reps: '30m', rest_seconds: 90 },
    { name: 'Battle rope', sets: 4, reps: '20s', rest_seconds: 60 },
  ],
  'HIIT': [
    { name: 'Burpee', sets: 4, reps: '10', rest_seconds: 30 },
    { name: 'Polichinelo', sets: 4, reps: '30s', rest_seconds: 15 },
    { name: 'Agachamento com salto', sets: 4, reps: '12', rest_seconds: 30 },
    { name: 'Mountain climber', sets: 4, reps: '30s', rest_seconds: 15 },
    { name: 'Corrida estacionária', sets: 4, reps: '30s', rest_seconds: 15 },
  ],
  'Mobilidade': [
    { name: 'Mobilidade de quadril', sets: 2, reps: '10 cada lado', rest_seconds: 30 },
    { name: 'Mobilidade de ombro', sets: 2, reps: '10', rest_seconds: 30 },
    { name: 'Alongamento posterior', sets: 2, reps: '30s', rest_seconds: 20 },
    { name: 'Alongamento de peito', sets: 2, reps: '30s', rest_seconds: 20 },
    { name: 'Liberação miofascial', sets: 2, reps: '60s por região', rest_seconds: 0 },
  ],
}

// Todos os exercícios (para autocomplete)
export const TODOS_EXERCICIOS: string[] = [
  // Peito
  'Supino reto', 'Supino inclinado', 'Supino declinado', 'Crucifixo reto', 'Crucifixo inclinado',
  'Cross over', 'Cross over baixo', 'Cross over alto', 'Flexão de braço', 'Flexão inclinada',
  // Costas
  'Puxada frente', 'Puxada aberta', 'Puxada supinada', 'Barra fixa', 'Remada curvada',
  'Remada unilateral', 'Remada baixa', 'Pulldown', 'Pullover', 'Remada cavalinho',
  // Ombro
  'Desenvolvimento com halter', 'Desenvolvimento com barra', 'Elevação lateral', 'Elevação frontal',
  'Elevação posterior', 'Arnold press', 'Crucifixo invertido', 'Face pull', 'Remada alta',
  // Bíceps
  'Rosca direta', 'Rosca alternada', 'Rosca concentrada', 'Rosca martelo', 'Rosca no banco inclinado',
  'Rosca 21', 'Rosca no cross', 'Rosca scott', 'Rosca inversa', 'Rosca com barra W',
  // Tríceps
  'Tríceps corda', 'Tríceps testa', 'Tríceps banco', 'Tríceps francês', 'Tríceps mergulho',
  'Tríceps no cross', 'Tríceps unilateral', 'Tríceps coice', 'Tríceps barra', 'Flexão diamante',
  // Pernas
  'Agachamento', 'Agachamento livre', 'Agachamento sumô', 'Leg press', 'Cadeira extensora',
  'Mesa flexora', 'Afundo', 'Passada', 'Hack machine', 'Stiff',
  // Glúteos
  'Elevação pélvica', 'Glute bridge', 'Coice no cabo', 'Abdução de quadril', 'Good morning',
  'Deadlift', 'Peso morto romeno', 'Step-up', 'Kickback', 'Hip thrust',
  // Panturrilha
  'Panturrilha em pé', 'Panturrilha sentado', 'Panturrilha no leg', 'Panturrilha unilateral', 'Panturrilha no smith',
  // Core
  'Abdominal reto', 'Abdominal infra', 'Abdominal oblíquo', 'Prancha', 'Prancha lateral',
  'Elevação de pernas', 'Crunch', 'Bicicleta', 'Russian twist', 'Hollow hold',
  // Funcional
  'Burpee', 'Mountain climber', 'Polichinelo', 'Corrida estacionária', 'Pular corda',
  'Kettlebell swing', 'Box jump', 'Sled push', 'Battle rope', 'Farmer walk',
  // Mobilidade
  'Alongamento posterior', 'Alongamento de peito', 'Mobilidade de quadril', 'Mobilidade de ombro', 'Liberação miofascial',
]

export function buildTitle(divisao: string, grupo: string, objetivo: string): string {
  const parts = []
  if (divisao) parts.push(divisao)
  if (grupo) parts.push(grupo)
  if (objetivo) parts.push(`(${objetivo})`)
  return parts.join(' — ')
}
