import { hollandMatchScore } from './holland.js'

export function calculateRecommendations(studentData, programs) {
  return programs
    .map(program => {
      const academic = calculateAcademic(studentData, program)
      const suast = calculateSUAST(studentData, program)
      const personal = calculatePersonalFit(studentData, program)
      const total = Math.round(academic * 0.45 + suast * 0.30 + personal * 0.25)

      const admission = estimateAdmissionChance(studentData, program)

      return {
        program,
        totalScore: total,
        breakdown: {
          academic: Math.round(academic),
          suast: Math.round(suast),
          personalFit: Math.round(personal),
        },
        admission,
      }
    })
    .filter(r => r.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}

function calculateAcademic(student, program) {
  const strandScores = { best: 100, alternative: 65, poor: 25 }
  let strandMatch = 0
  const strand = (student.strand || '').toUpperCase()
  const compat = (program.compatible_strands || []).map(s => s.toUpperCase())
  const alt = (program.alternative_strands || []).map(s => s.toUpperCase())
  const poor = (program.incompatible_strands || []).map(s => s.toUpperCase())
  if (compat.includes(strand)) strandMatch = strandScores.best
  else if (alt.includes(strand)) strandMatch = strandScores.alternative
  else strandMatch = strandScores.poor

  const weights = program.weighted_subjects || { math: 0.25, science: 0.25, english: 0.25, filipino: 0.25 }
  const grades = student.grades || {}
  let coreSum = 0
  let coreWeight = 0
  for (const [subj, weight] of Object.entries(weights)) {
    if (grades[subj]) {
      coreSum += grades[subj] * weight
      coreWeight += weight
    }
  }
  const coreGrades = coreWeight > 0 ? coreSum / coreWeight : 0

  const strandSpecific = student.strandSpecificGrades || {}
  let ssSum = 0
  let ssCount = 0
  for (const val of Object.values(strandSpecific)) {
    if (val) { ssSum += val; ssCount++ }
  }
  const strandSpecificScore = ssCount > 0 ? ssSum / ssCount : coreGrades

  const strandComponent = strandMatch * 0.25
  const gradesComponent = (coreGrades / 100) * 100 * 0.40
  const specificComponent = (strandSpecificScore / 100) * 100 * 0.35

  return strandComponent + gradesComponent + specificComponent
}

function calculateSUAST(student, program) {
  const suastWeights = program.suast_subtest_weights || {
    general_ability: 0.20, numerical_aptitude: 0.20, verbal_aptitude: 0.20,
    spatial_aptitude: 0.15, perceptual_aptitude: 0.15, manual_dexterity: 0.10
  }

  const tiers = student.suastTiers || {}
  const tierScores = { very_high: 95, high: 80, moderate: 65, low: 40, not_taken: 50 }
  const keyMap = {
    general_ability: 'general_ability', numerical_aptitude: 'numerical_aptitude',
    verbal_aptitude: 'verbal_aptitude', spatial_aptitude: 'spatial_aptitude',
    perceptual_aptitude: 'perceptual_aptitude', manual_dexterity: 'manual_dexterity'
  }

  let subtestSum = 0
  let subtestWeight = 0
  for (const [key, weight] of Object.entries(suastWeights)) {
    const mappedKey = keyMap[key] || key
    const tier = tiers[mappedKey] || 'not_taken'
    subtestSum += (tierScores[tier] || 50) * weight
    subtestWeight += weight
  }
  const relevantScore = subtestWeight > 0 ? subtestSum / subtestWeight : 50

  const overallTier = tiers.overall || 'not_taken'
  const overallScore = tierScores[overallTier] || 50

  return relevantScore * 0.60 + overallScore * 0.40
}

function calculatePersonalFit(student, program) {
  const holland = student.hollandCode
  let hollandScore = 50
  if (holland && holland.scores) {
    hollandScore = hollandMatchScore(
      holland,
      program.holland_codes || ['I', 'C'],
      program.holland_code_weights || { I: 0.50, C: 0.50 }
    )
  }

  const programClusters = program.career_clusters || []
  const interests = student.interests || {}
  let interestScore = 50
  if (programClusters.length > 0) {
    let sum = 0
    let count = 0
    for (const cluster of programClusters) {
      if (interests[cluster]) { sum += interests[cluster] * 20; count++ }
    }
    if (count > 0) interestScore = sum / count
  }

  const progSkills = program.required_skills || {}
  const stuSkills = student.skills || {}
  let skillDist = 0
  let skillCount = 0
  for (const [skill, progVal] of Object.entries(progSkills)) {
    const stuVal = stuSkills[skill] || 3
    skillDist += Math.abs(stuVal - progVal) / 4
    skillCount++
  }
  const skillsScore = skillCount > 0 ? 100 * (1 - skillDist / skillCount) : 50

  return Math.round(hollandScore * 0.50 + interestScore * 0.30 + skillsScore * 0.20)
}

function estimateAdmissionChance(student, program) {
  const gwa = student.gwa || 85
  const suastTier = (student.suastTiers || {}).overall || 'not_taken'
  const strand = (student.strand || '').toUpperCase()
  const compat = (program.compatible_strands || []).map(s => s.toUpperCase())
  const alt = (program.alternative_strands || []).map(s => s.toUpperCase())

  const gwaScore = gwa >= 92 ? 'high' : gwa >= 85 ? 'moderate' : 'low'
  const tierMap = { very_high: 'high', high: 'high', moderate: 'moderate', low: 'low', not_taken: 'moderate' }
  const suastScore = tierMap[suastTier] || 'moderate'
  const strandScore = compat.includes(strand) ? 'high' : alt.includes(strand) ? 'moderate' : 'low'

  const points = { high: 2, moderate: 1, low: 0 }
  const total = points[gwaScore] * 0.40 + points[suastScore] * 0.40 + points[strandScore] * 0.20

  if (total >= 1.5) return { label: 'High', color: 'green', value: '≥ 75%' }
  if (total >= 0.8) return { label: 'Moderate', color: '#cc8800', value: '50–74%' }
  return { label: 'Low', color: 'red', value: '< 50%' }
}
