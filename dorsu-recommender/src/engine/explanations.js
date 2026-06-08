const STRAND_LABELS = {
  best: 'perfect match',
  alternative: 'alternative match',
  poor: 'not typically aligned',
}

export function generateExplanations(result, studentData) {
  const { program, breakdown, admission, totalScore } = result
  const lines = []

  const strand = (studentData.strand || '').toUpperCase()
  const compat = (program.compatible_strands || []).map(s => s.toUpperCase())
  const alt = (program.alternative_strands || []).map(s => s.toUpperCase())
  if (compat.includes(strand)) {
    lines.push(`Your ${studentData.strand} strand is a ${STRAND_LABELS.best} for this program.`)
  } else if (alt.includes(strand)) {
    lines.push(`Your ${studentData.strand} strand is an ${STRAND_LABELS.alternative} for this program.`)
  }

  if (breakdown.academic >= 80) {
    lines.push(`Your academic profile (${breakdown.academic}%) aligns strongly with the program's requirements, especially in weighted subjects.`)
  } else if (breakdown.academic >= 60) {
    lines.push(`Your academic background (${breakdown.academic}%) meets the baseline requirements.`)
  }

  if (breakdown.suast >= 80) {
    lines.push(`Your SUAST aptitude scores (${breakdown.suast}%) indicate strong alignment with the skills this program requires.`)
  } else if (breakdown.suast >= 60) {
    lines.push(`Your SUAST performance (${breakdown.suast}%) suggests reasonable aptitude for this field.`)
  }

  if (program.holland_codes && studentData.hollandCode?.code) {
    const studentLetters = studentData.hollandCode.code.split('')
    const match = program.holland_codes.some(h => studentLetters.includes(h[0]))
    if (match) {
      lines.push(`Your Holland personality type (${studentData.hollandCode.code}) shares traits with students who thrive in this program.`)
    }
  }

  if (breakdown.personalFit >= 80) {
    lines.push(`Your interests and skills are a strong fit for this program (${breakdown.personalFit}% personal match).`)
  }

  if (admission.label === 'High') {
    lines.push(`You have a high chance of admission (${admission.value}) based on your GWA, strand, and aptitude.`)
  } else if (admission.label === 'Moderate') {
    lines.push(`Your admission chance is moderate (${admission.value}). Strengthening your grades can improve this.`)
  } else {
    lines.push(`Admission is competitive (${admission.value}). Consider improving your GWA and SUAST scores.`)
  }

  return lines
}

export function calculateSkillsGap(studentData, program) {
  const progSkills = program.required_skills || {}
  const stuSkills = studentData.skills || {}

  return Object.entries(progSkills).map(([skill, required]) => {
    const studentVal = stuSkills[skill] || 3
    const gap = studentVal - required
    return {
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      studentRating: studentVal,
      required,
      gap,
      status: gap >= 0 ? 'met' : gap >= -1 ? 'close' : 'gap',
    }
  })
}
