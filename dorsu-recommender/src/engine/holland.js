export function calculateHollandCode(answers) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const dimMap = {
    Realistic: 'R', Investigative: 'I', Artistic: 'A',
    Social: 'S', Enterprising: 'E', Conventional: 'C'
  }

  for (const [dim, val] of Object.entries(answers)) {
    const code = dimMap[dim]
    if (code) scores[code] = val
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0])

  return { code: sorted.join(''), scores, top3: sorted }
}

export function hollandMatchScore(studentCode, programCodes, programWeights) {
  let score = 0
  const codeOrder = ['R', 'I', 'A', 'S', 'E', 'C']
  const studentScores = {}
  for (let i = 0; i < studentCode.top3.length; i++) {
    studentScores[studentCode.top3[i]] = 3 - i
  }
  for (const [code, weight] of Object.entries(programWeights)) {
    const studentVal = studentScores[code] || 0
    score += (studentVal / 3) * weight * 100
  }
  return Math.round(Math.min(score, 100))
}
