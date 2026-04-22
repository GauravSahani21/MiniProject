import os

pages = [
    'LandingPage','LoginPage','ParentDashboard','AddChildPage','ChildDetailPage',
    'ScreeningPage','ResultPage','HistoryPage','DoctorDashboard','PatientDetailPage',
    'AwarenessPage','AdminPanel','NotFoundPage'
]
components = ['Navbar','Chatbot','UI']

for name in pages:
    lines = [
        'import React from "react";',
        'export default function ' + name + '() {',
        '  return (',
        '    <div style={{ paddingTop: "88px", padding: "100px 32px" }}>',
        '      <h2>' + name + ' coming soon...</h2>',
        '    </div>',
        '  );',
        '}',
    ]
    path = os.path.join('src', 'pages', name + '.jsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

for name in components:
    lines = [
        'import React from "react";',
        'export default function ' + name + '() { return null; }',
    ]
    path = os.path.join('src', 'components', name + '.jsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

print('All stubs created OK')
