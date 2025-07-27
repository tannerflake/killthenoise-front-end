export interface Issue {
  id: number;
  title: string;
  description: string;
  source: string;
  severity: number;
  frequency: number;
  status: string;
  type: 'bug' | 'feature';
  tags?: string[];
  jira_issue_key?: string;
  jira_status?: string;
  jira_exists: boolean;
  created_at: string;
  updated_at: string;
}

export const mockHubspotIssues: Issue[] = [
  {
    id: 1,
    title: 'Login button unresponsive',
    description: 'Users report that clicking the login button does nothing on Safari.',
    source: 'hubspot',
    severity: 4,
    frequency: 27,
    status: 'open',
    type: 'bug',
    tags: ['auth', 'ui'],
    jira_exists: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Export CSV includes hidden columns',
    description: 'Exported CSV files contain columns the user had hidden in the table view.',
    source: 'hubspot',
    severity: 3,
    frequency: 13,
    status: 'open',
    type: 'bug',
    tags: ['export'],
    jira_issue_key: 'KTN-102',
    jira_status: 'To Do',
    jira_exists: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Add dark-mode option',
    description: 'Many customers would like a native dark-mode theme switcher.',
    source: 'hubspot',
    severity: 2,
    frequency: 45,
    status: 'open',
    type: 'feature',
    tags: ['design', 'accessibility'],
    jira_exists: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Incorrect total on checkout',
    description: 'The final checkout total occasionally does not include shipping costs.',
    source: 'hubspot',
    severity: 5,
    frequency: 8,
    status: 'open',
    type: 'bug',
    tags: ['checkout', 'payments'],
    jira_exists: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Search results pagination',
    description: 'Users want the ability to paginate search results instead of infinite scroll.',
    source: 'hubspot',
    severity: 1,
    frequency: 20,
    status: 'open',
    type: 'feature',
    tags: ['search', 'ux'],
    jira_exists: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]; 