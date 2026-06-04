# DCPR: A Rule-Based College Program Recommender System for Davao Oriental State University

## A Capstone Project Proposal

<br>

<br>

<br>

**Presented to the Faculty of the College of Computing, Engineering, and Technology**

**Davao Oriental State University**

<br>

<br>

<br>

<br>

<br>

<br>

<br>

<br>

---

*Note: This document follows APA 7th edition formatting guidelines.*

---

---

## Chapter 1: Introduction

### Background of the Study

The transition from Senior High School (SHS) to college remains one of the most consequential decisions in a Filipino student's academic journey. Under the K-12 program (Republic Act 10533), students choose from seven SHS strands—STEM, ABM, HUMSS, GAS, TVL, Sports, and Arts and Design—each designed to prepare them for specific tertiary programs. However, research shows that students often make this decision with limited data-driven guidance. The National Career Assessment Examination (NCAE), administered in Grade 9, provides strand recommendations, but no existing system bridges the gap between strand selection and college program selection at a specific university.

Davao Oriental State University (DOrSU) serves 16,514 students across six campuses in Davao Oriental as of academic year 2025–2026: Main Campus in Mati City (11,473), Baganga (797), Banaybanay (1,189), Cateel (1,436), San Isidro (1,236), and Tarragona (383). As a state university operating under the Free Higher Education Act (Republic Act 10931), DOrSU admits students from diverse socioeconomic backgrounds. Its primary admission instrument is the State University Aptitude and Scholarship Test (SUAST), an entrance examination covering six aptitude areas: General Ability, Verbal Aptitude, Numerical Aptitude, Spatial Aptitude, Perceptual Aptitude, and Manual Dexterity.

A critical finding from Singh and Montejo (2023) reveals that the SUAST passing rate was only 54% for the academic years 2018–2023. Furthermore, their study found that non-passers were still accepted due to policy changes, which "undermine the purpose of the examination" (Singh & Montejo, 2023, p. 2). Valdez et al. (2023) analyzed 2,112 first-time freshmen and found a mean SUAST composite score of 134, classified as "Low" on the descriptive equivalent scale. Their study identified Senior High School General Weighted Average (SHS GWA) as a significant predictor of SUAST performance, alongside library access, family income, and academic self-belief.

These findings highlight two interconnected problems: (a) many DOrSU applicants are underprepared for the SUAST, and (b) the current admission process does not provide students with a proactive, personalized roadmap for selecting programs aligned with their academic profile, aptitudes, and personal characteristics.

Existing recommender systems such as Kuropii's (2024) SHS Strand Recommender and the GO SHS platform provide strand-level guidance but stop short of college program specificity. The most closely related academic work is Bucad's (2025) study at the University of Makati, which achieved 85% accuracy using Label Powerset with Decision Tree classification across four dimensions: grades, IQ, personality, interests, and self-skills. Conversely, Bornea and Bugarin (2026) at the University of Southeastern Philippines demonstrated that grades alone yield only 53.75% accuracy, underscoring the need for multidimensional assessment.

This capstone proposes DCPR (DOrSU College Program Recommender), a rule-based system that integrates strand compatibility, SHS grades, SUAST aptitude estimation, Holland Code (RIASEC) personality types, career interest inventory, and self-reported skills to generate ranked college program recommendations specifically for DOrSU's approximately 35 undergraduate programs across seven faculties.

### Statement of the Problem

DOrSU-bound Grade 12 students lack a systematic, evidence-based tool that:

1.  Matches their SHS strand, grades, and SUAST aptitude profile to DOrSU's specific program offerings;
2.  Provides transparent, explainable scoring rather than opaque "black-box" predictions;
3.  Estimates their admission probability using research-backed benchmarks; and
4.  Generates a comprehensive, portable report for guidance counseling.

No existing system addresses the specific context of DOrSU—its unique program offerings, its SUAST examination characteristics (mean score 134, 54% pass rate), and the academic profiles of its applicant pool (16,514 students, predominantly from Davao Oriental).

### Objectives of the Study

#### General Objective

To develop a rule-based college program recommender system for Davao Oriental State University that generates ranked, evidence-based program recommendations for Grade 12 students based on their academic profile, aptitude, and personal characteristics.

#### Specific Objectives

1.  To construct a comprehensive DOrSU program database encoding strand compatibility, weighted subject requirements, SUAST subtest weightings, Holland Code mappings, and required skills profiles for each program across the university's seven faculties.
2.  To design a three-component scoring algorithm—Academic (45%), SUAST Aptitude (30%), and Personal Fit (25%)—calibrated against known SUAST metrics (mean score of 134, 54% pass rate).
3.  To implement a web-based student input wizard that collects SHS strand, grades, SUAST performance tiers, Holland Code assessment results (30 questions), career interest ratings (10 clusters), and self-skills ratings (6 dimensions).
4.  To build an interactive results dashboard displaying ranked recommendations with per-program score breakdowns, admission chance estimates, and alternative pathway suggestions.
5.  To validate the system's calibration against published SUAST research data and through expert review by guidance counselors.

### Scope and Limitations

#### Scope

The target university is Davao Oriental State University only, covering all six campuses (Main, Baganga, Banaybanay, Cateel, San Isidro, Tarragona). Program coverage includes all approximately 35 undergraduate programs across seven faculties. The user base comprises Grade 12 students and SHS graduates applying to DOrSU. The system assesses five data dimensions: SHS strand, grades, SUAST aptitude (self-reported tiers), Holland Code personality type, career interest, and self-rated skills. Output consists of ranked top-10 program recommendations with score breakdowns and admission chance estimates.

#### Limitations

The system uses a deterministic, rule-based scoring algorithm rather than machine learning. Machine learning integration is deferred until 500 or more student profiles are collected for training data. Since DOrSU does not publicly disclose SUAST scoring formulas, the system uses a heuristic tier-based system calibrated against the published mean score of 134 and 54% pass rate. The initial release is student-facing only; a counselor dashboard with analytics capabilities is planned for a future phase. Validation is limited to calibration against published research and expert review; longitudinal tracking of actual enrollment outcomes is deferred to post-deployment. SUAST scores are self-reported as performance tiers rather than actual index scores due to privacy considerations.

### Significance of the Study

**Students.** Grade 12 students gain access to a free, personalized tool that helps them make informed college program decisions, potentially reducing mismatched enrollments and improving academic outcomes.

**DOrSU Admissions Office.** The system provides a pipeline tool that could, with future data collection, offer insights into applicant profiles and program demand patterns.

**Guidance Counselors.** The generated PDF reports serve as structured inputs for counseling sessions, supplementing the NCAE results already available.

**Research Community.** The study contributes to the limited body of Philippine-specific college recommender system literature, particularly for state universities in Mindanao.

---

## Chapter 2: Review of Related Literature and Studies

### The Philippine SHS Strand System and NCAE

The Enhanced Basic Education Act of 2013 (Republic Act 10533) established the K-12 program, requiring two years of Senior High School with specialized tracks. Students choose from Academic (STEM, ABM, HUMSS, GAS), TVL, Sports, or Arts and Design strands. The NCAE, administered in Grade 9, assesses Science, Math, Abstract Reasoning, Verbal, Reading Comprehension, Clerical, and Vocational aptitude to recommend appropriate strands. However, the Department of Education (DepEd) only publishes cutoff scores for STEM (Grade 85+ in Math and Science with NCEA percentile ≥ 86); other strands have no official cutoffs, limiting the NCAE's prescriptive value (DepEd, 2019).

### Existing Recommender Systems

Kuropii's (2024) open-source SHS Strand Recommender is a Streamlit-based rule engine that uses student grades and NCAE-like test scores to recommend among five strands. It is the closest open-source implementation available but stops entirely at strand level—it cannot recommend specific college programs.

The GO SHS platform provides career guidance and scholarship information but functions primarily as an informational portal rather than a personalized recommendation engine.

### Predictive Studies on College Program Suitability

Bucad (2025) at the University of Makati developed a strand recommender using Label Powerset ensemble classification with Decision Tree, achieving 85% accuracy. The study used five data dimensions: grades, IQ, personality (Big Five), interests, and self-skills. While the accuracy is compelling, the system recommends strands rather than college programs and was trained on University of Makati-specific data.

Bornea and Bugarin (2026) at the University of Southeastern Philippines evaluated K-Nearest Neighbors for predicting college program fit using only academic grades. Their model achieved just 53.75% accuracy, empirically demonstrating that grades alone are insufficient for accurate college program recommendations.

These two studies bound the design space: multidimensional assessment yields 85% accuracy, while grades-only yields near-chance results. DCPR adopts the multidimensional approach but applies it to program-level recommendations rather than strand-level and uses transparent rule-based scoring instead of black-box machine learning.

### SUAST Research

Singh and Montejo (2023), published in the *Davao Research Journal*, conducted a study titled "Bridging the Gap: A Comparative Analysis of Traditional and Neural Network Regression Methods for Predicting University Entrant Performance in SUAST Examination." Key findings from their analysis of 359 respondents include:

- The SUAST passing rate was 54% for academic years 2018–2023.
- Significant predictors of SUAST scores included family income, SHS GWA, library entry, intrinsic goal orientation, openness and intellect, and behavioral reaction.
- Multi-Layer Perceptron Neural Network (MLPNN) outperformed Multiple Linear Regression in prediction accuracy.
- Library access and resources were identified as the single most important predictor.

Valdez et al. (2023) conducted a validity study on 2,112 first-time freshmen, finding a mean SUAST composite score of 134 (classified as "Low") and confirming that SHS GWA is a significant predictor of SUAST performance with concurrent validity against first-year college GPA.

These findings directly inform DCPR's design: the system weights SHS GWA heavily (45% academic component) and calibrates its SUAST tier system to the known mean of 134.

### Holland Code (RIASEC) Theory

John Holland's theory of vocational choice (Holland, 1959, 1997) posits that career satisfaction correlates with the congruence between personality type and work environment. The six types are:

- **Realistic (R):** Practical, hands-on, works with things.
- **Investigative (I):** Analytical, intellectual, scientific.
- **Artistic (A):** Creative, expressive, innovative.
- **Social (S):** Helping, teaching, caring.
- **Enterprising (E):** Leading, persuading, managing.
- **Conventional (C):** Organized, detail-oriented, structured.

Holland's framework is widely used in career guidance globally and has been validated in Philippine contexts. The O*NET database (National Center for O*NET Development, 2024) provides RIASEC codes for thousands of occupations, which can be mapped to CHED-recognized programs.

DCPR implements a 30-question RIASEC assessment derived from established Holland inventories. Each program is tagged with its ideal Holland profile (e.g., BS Computer Science: Investigative plus Conventional; BS Nursing: Social plus Investigative).

### CHED Priority Courses

The Commission on Higher Education (CHED, 2024) organizes priority courses into ten fields: Science and Mathematics, Information Technology, Engineering and Technology, Architecture and Design, Business and Management, Health Professions, Maritime, Social Sciences, Teacher Education, and Multi/Interdisciplinary programs. DOrSU offers programs in most of these fields, and DCPR tags each program with its CHED priority status to help students identify competitively advantageous programs.

### Synthesis

The literature reveals a clear gap: existing tools stop at strand recommendation (NCAE, Kuropii, 2024), focus on single-university machine learning models without explainability (Bucad, 2025), or prove that unidimensional approaches are insufficient (Bornea & Bugarin, 2026). DCPR fills this gap by providing university-specific recommendations for DOrSU's programs and SUAST examination, transparent rule-based scoring with accessible breakdowns, multidimensional assessment across five dimensions, and calibration against published SUAST research metrics.

---

## Chapter 3: Theoretical and Technical Framework

### Theoretical Framework

DCPR operates on an Input-Process-Output (IPO) model. The input layer comprises four data categories: SHS strand selection, SHS subject grades, SUAST performance tiers, and personal profile (Holland Code, career interests, self-rated skills). The process layer applies the scoring algorithm, which computes three component scores—Academic (45%), SUAST Aptitude (30%), and Personal Fit (25%)—and combines them into a weighted total score per program. An admission chance model then estimates probability tiers. The output layer presents ranked top-10 recommendations with score breakdowns and a downloadable PDF report.

### Scoring Algorithm Design

The total score for each program is calculated as:

**Total Score = (Academic Score × 0.45) + (SUAST Score × 0.30) + (Personal Fit Score × 0.25)**

#### Academic Score (45% of Total)

**Academic Score = StrandMatch × 0.25 + CoreGrades × 0.40 + StrandSpecific × 0.35**

*Strand Match.* Categorical scoring based on a three-tier compatibility system:

- Best strand: 100 points.
- Alternative strand: 65 points.
- Poor fit strand: 25 points.

*Core Grades.* Weighted average of four core subjects (Math, Science, English, Filipino), with weights varying by program. For example, BS Civil Engineering weights mathematics at 0.40 and science at 0.30, while AB English weights English at 0.45.

*Strand-Specific Grades.* SHS specialization subjects relevant to the program. If unavailable, core grades are used as a proxy.

#### SUAST Aptitude Score (30% of Total)

**SUAST Score = RelevantSubtests × 0.60 + OverallTier × 0.40**

*Relevant Subtests.* Weighted combination of SUAST subtests (General Ability, Numerical, Verbal, Spatial, Perceptual) with weights per program. For example, BSIT weights Numerical at 0.30 and General at 0.20.

*Overall Tier.* Mapped from the student's self-reported composite tier:

| Composite Tier | Index Range | Score |
|---|---|---|
| Very High | > 160 | 95 |
| High | 145–160 | 80 |
| Moderate | 130–144 | 65 |
| Low | < 130 | 40 |
| Not taken | — | 50 (neutral) |

The Moderate tier (score 65) is calibrated to the published SUAST mean of 134 (Valdez et al., 2023).

#### Personal Fit Score (25% of Total)

**Personal Fit Score = HollandMatch × 0.50 + InterestMatch × 0.30 + SkillsMatch × 0.20**

*Holland Match.* Weighted sum of the student's top-3 RIASEC types compared against the program's ideal profile. Each program stores three Holland types with weights (e.g., BS Nursing: S = 0.50, I = 0.30, R = 0.20).

*Interest Match.* Euclidean similarity between the student's ratings of 10 career clusters and the program's cluster membership.

*Skills Match.* Euclidean distance between the student's self-rated skills (six dimensions: Analytical, Creative, Social, Technical, Leadership, Organizational; 5-point scale) and the program's required skills profile.

### Admission Chance Model

A three-factor heuristic estimates admission probability:

| Factor | Weight | High | Moderate | Low |
|---|---|---|---|---|
| SHS GWA | 0.40 | ≥ 92 | 85–91 | < 85 |
| SUAST Tier | 0.40 | > 160 | 130–160 | < 130 |
| Strand Fit | 0.20 | Best | Alternative | Poor |

- **High (≥ 75%):** At least two factors in high range.
- **Moderate (50–74%):** At least two factors in moderate or above.
- **Low (< 50%):** Two or more factors in low range.

The model is calibrated so that across a random distribution of applicants, approximately 50–58% receive a "Moderate" or "High" rating, matching the known 54% SUAST pass rate (Singh & Montejo, 2023).

### Technical Architecture

DCPR uses a three-tier web architecture. The presentation tier uses React 18 with Vite build tool, Tailwind CSS for styling, and React Router for navigation. The scoring engine is implemented in pure JavaScript for client-side execution, eliminating server round-trips during the recommendation process. The application tier uses Node.js with Express, providing a lightweight REST API for student data persistence (with consent), program database management, and PDF report generation. For the minimum viable product (MVP), the program database is stored as a static JSON file bundled with the application. For Phase 2, a PostgreSQL database will store student profiles, program data, and analytics. The JSON schema mirrors the SQL schema for straightforward migration.

---

## Chapter 4: System Design and Methodology

### Program Database Construction

The complete DOrSU program database will be constructed through three methods: official sources including the DOrSU website (dorsu.edu.ph), academic faculty pages, admissions office postings, and the DOrSU Student Profile Form (FM-DOrSU-ODI-05); research validation through cross-reference with CHED priority course listings, published program descriptions, and the *Davao Research Journal*; and expert review by at least two guidance counselors familiar with DOrSU programs.

Each program record contains 15 or more fields encoding strand compatibility, subject weights, SUAST weights, Holland mapping, skills requirements, career paths, and admission tiers. The database covers all approximately 35 programs across seven faculties.

### Strand-to-Program Mapping

A three-tier compatibility matrix maps each SHS strand to each program:

| Compatibility | Meaning | Score |
|---|---|---|
| Best | Most aligned SHS strand for this program | 100 |
| Alternative | Acceptable but may need bridging | 65 |
| Poor | Technically possible but academically mismatched | 25 |

The mapping follows Philippine standard practice (e.g., STEM for engineering, ABM for accountancy, HUMSS for education) and will be validated by guidance counselors.

### SUAST Subtest-to-Program Weighting

Each program stores a weight for each SUAST subtest reflecting its relevance. Illustrative weightings include:

| Program | General | Numerical | Verbal | Spatial | Perceptual | Manual Dex |
|---|---|---|---|---|---|---|
| BSIT | 0.20 | 0.30 | 0.15 | 0.20 | 0.10 | 0.05 |
| BSCE | 0.15 | 0.30 | 0.10 | 0.25 | 0.10 | 0.10 |
| BS Nursing | 0.20 | 0.20 | 0.20 | 0.10 | 0.15 | 0.15 |
| AB English | 0.15 | 0.05 | 0.45 | 0.05 | 0.20 | 0.10 |

These weights are designed based on the cognitive demands of each program's curriculum and will be validated during expert review.

### Holland Code (RIASEC) Assessment Module

A 30-question assessment measures the six RIASEC dimensions with five questions each. Each question uses a 5-point Likert scale (Strongly Disagree to Strongly Agree). Example items include "I enjoy working with tools and machinery" for Realistic; "I enjoy solving complex problems and puzzles" for Investigative; "I enjoy creative activities like writing, drawing, or music" for Artistic; "I enjoy teaching or helping others" for Social; "I enjoy leading groups and persuading others" for Enterprising; and "I enjoy organizing data and following procedures" for Conventional. The three highest-scoring dimensions form the student's Holland code (e.g., "IRC" for Investigative-Realistic-Conventional).

### User Flow

The system follows an eight-step wizard flow: Welcome Screen, Basic Information (strand, school), SHS Grades Input (core and strand-specific subjects with auto-calculated GWA), SUAST Tiers Input (six subtests plus overall tier), Holland Code Quiz (30 questions, approximately 10 minutes), Interest Inventory (10 career clusters on a 5-point scale), Self-Skills Rating (6 skills on a 5-point scale), and Results Dashboard (top 10 ranked programs with clickable score breakdowns, admission chance estimates, list saving, and PDF report generation).

### Test Data and Calibration

Since no sample student data is available, calibration follows a two-phase approach.

**Phase 1: Synthetic Student Profiles.** Thirty synthetic profiles will be generated covering all seven strands and a range of grade levels (75–98), SUAST tiers, and Holland codes. The scoring engine's output distribution will be checked against the following constraints: mean overall score across all programs for all students should center near 65–70 (reflecting the 54% pass rate as a "moderate" threshold); STEM students should rank highest in engineering programs; ABM students should rank highest in business programs; and HUMSS students should rank highest in education and social science programs.

**Phase 2: Expert Review.** Two guidance counselors will review the program rankings for 10 synthetic profiles and provide qualitative feedback on whether the top-3 recommendations appear appropriate, whether admission chance estimates seem reasonable, and whether the score breakdowns are explainable and useful.

### Development Methodology

The project follows an Agile methodology with two-week sprints. Sprint 1 (Days 1–14) covers program database construction, scoring engine implementation, and unit testing with synthetic profiles. Sprint 2 (Days 15–28) covers frontend wizard implementation (all eight steps), the Holland Quiz component, and basic results display. Sprint 3 (Days 29–42) covers the results dashboard with score breakdowns, admission chance estimator, PDF report generation, and UI polish. Sprint 4 (Days 43–56) covers calibration, expert review, bug fixes, and deployment preparation.

---

## Chapter 5: Project Management

### Gantt Chart

| Task | Week 1–2 | Week 3–4 | Week 5–6 | Week 7–8 |
|---|---|---|---|---|
| Program Database Construction | ████████ | | | |
| Scoring Engine Implementation | ████████ | | | |
| Unit Testing (Synthetic Profiles) | ████████ | | | |
| Frontend Wizard (Steps 1–4) | | ████████ | | |
| Frontend Wizard (Steps 5–8) | | ████████ | | |
| Holland Quiz Component | | ████████ | | |
| Results Dashboard | | | ████████ | |
| Score Breakdown and Admission Chance | | | ████████ | |
| PDF Report Generation | | | ████████ | |
| UI Polish and Responsive Design | | | ████████ | |
| Calibration and Expert Review | | | | ████████ |
| Bug Fixes and Deployment | | | | ████████ |

### Resource Requirements

Development requires any modern laptop with Node.js version 18 or later and Visual Studio Code. The frontend uses React 18 with Vite and Tailwind CSS (all free and open-source). The backend uses Node.js with Express. Hosting will be provided by Vercel (frontend) and Render (API), both offering free tiers. PostgreSQL will be hosted via Supabase or Render's free tier. Version control uses GitHub.

### Testing Plan

| Test Type | Method | Success Criteria |
|---|---|---|
| Unit Tests | Jest for scoring engine functions | All scoring functions return values in range 0–100 |
| Synthetic Profile Tests | 30 profiles across all strands | Top-3 recommendations align with strand expectations |
| Calibration Check | Compare output distribution to 54% pass rate | Within ±5% of 54% "Moderate+" rate |
| Expert Review | Two counselors review 10 profiles | Qualitative agreement with recommendations |
| UI/UX Testing | Five students complete full wizard | Under 10 minutes completion time, no errors |

### Success Metrics

| Metric | Target |
|---|---|
| SUAST pass rate calibration | Output reflects 54% ± 3% historical rate |
| Expert agreement | ≥ 80% counselor approval of top-3 recommendations |
| Wizard completion rate | ≥ 90% of started sessions reach results |
| Mean completion time | ≤ 12 minutes |
| PDF report completeness | All required sections present in generated report |

---

## References

Bornea, J., & Bugarin, R. (2026). *Predicting college program suitability using K-Nearest Neighbors algorithm based on academic grades* [Unpublished manuscript]. University of Southeastern Philippines.

Bucad, M. (2025). Senior High School strand recommender system using Label Powerset and Decision Tree. *Universitas*, *14*(1), 45–58.

Commission on Higher Education. (2024). *List of CHED priority courses*. https://chedscholarship.com/list-of-ched-priority-courses

Department of Education. (2019). *DepEd Order No. 21, s. 2019: Enhanced Basic Education Curriculum.*

Holland, J. L. (1959). A theory of vocational choice. *Journal of Counseling Psychology*, *6*(1), 35–45. https://doi.org/10.1037/h0040767

Holland, J. L. (1997). *Making vocational choices: A theory of vocational personalities and work environments* (3rd ed.). Psychological Assessment Resources.

Kuropii. (2024). *SHS strand recommendation system* [Source code]. GitHub. https://github.com/Kuropii/shs-strand-recommendation

National Center for O*NET Development. (2024). *O*NET database*. https://www.onetonline.org/

Singh, N. A., & Montejo, D. C. (2023). Bridging the gap: A comparative analysis of traditional and neural network regression methods for predicting university entrant performance in SUAST examination. *Davao Research Journal*, *14*(2), Article 116. https://doi.org/10.59120/drj.v14i2.116

Valdez, G., Masinading, G., & Singh, N. A. (2023). The validity of SUAST scores and high school grade point average in predicting academic performance of freshmen students. *International Research Journal of Science, Technology, Education, and Management*, *3*(3), 1–12.
