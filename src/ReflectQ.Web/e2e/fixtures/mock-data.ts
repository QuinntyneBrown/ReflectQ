export const mockQuestions = [
  {
    id: '1',
    title: 'How satisfied are you with the onboarding process?',
    body: 'Please rate your experience with our onboarding flow.',
    type: 'rating',
    status: 'active',
    createdAt: '2026-03-10T10:00:00Z',
    responseCount: 42,
    archived: false,
  },
  {
    id: '2',
    title: 'What feature would you like to see next?',
    body: 'Share your ideas for upcoming features.',
    type: 'open-ended',
    status: 'active',
    createdAt: '2026-03-12T14:30:00Z',
    responseCount: 18,
    archived: false,
  },
  {
    id: '3',
    title: 'Which department do you work in?',
    body: 'Select your department from the options below.',
    type: 'multiple-choice',
    status: 'draft',
    createdAt: '2026-03-15T09:00:00Z',
    responseCount: 0,
    archived: false,
    options: ['Engineering', 'Design', 'Marketing', 'Sales', 'Support'],
  },
  {
    id: '4',
    title: 'Rate the last team meeting',
    body: 'How effective was the last all-hands meeting?',
    type: 'rating',
    status: 'closed',
    createdAt: '2026-02-20T08:00:00Z',
    responseCount: 85,
    archived: true,
  },
];

export const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2026-01-15T10:00:00Z',
    lastLogin: '2026-03-22T09:30:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'editor',
    createdAt: '2026-02-01T11:00:00Z',
    lastLogin: '2026-03-21T14:00:00Z',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'viewer',
    createdAt: '2026-03-01T09:00:00Z',
    lastLogin: '2026-03-20T16:45:00Z',
  },
];

export const mockResponses = [
  {
    id: 'r1',
    questionId: '1',
    value: 4,
    respondent: 'Anonymous',
    submittedAt: '2026-03-22T10:15:00Z',
  },
  {
    id: 'r2',
    questionId: '1',
    value: 5,
    respondent: 'Anonymous',
    submittedAt: '2026-03-22T11:30:00Z',
  },
  {
    id: 'r3',
    questionId: '1',
    value: 3,
    respondent: 'Anonymous',
    submittedAt: '2026-03-22T12:00:00Z',
  },
  {
    id: 'r4',
    questionId: '2',
    value: 'A built-in analytics dashboard with export options.',
    respondent: 'Anonymous',
    submittedAt: '2026-03-22T13:00:00Z',
  },
  {
    id: 'r5',
    questionId: '2',
    value: 'Better mobile experience for respondents.',
    respondent: 'Anonymous',
    submittedAt: '2026-03-22T14:00:00Z',
  },
];

export const mockDashboard = {
  activeQuestion: mockQuestions[0],
  responseCount: 42,
  recentResponses: mockResponses.filter((r) => r.questionId === '1'),
  chartData: {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    values: [2, 5, 8, 15, 12],
  },
};

export const mockCurrentUser = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'admin',
};
