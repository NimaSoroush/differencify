export default results =>
`<html>
  <head>
    <title>Differencify report</title>
    <style type="text/css">
    body {
      font-family: Helvetica, Arial, sans-serif;
      color: #24292e;
    }
    table {
      border-collapse: collapse;
    }
    table, th, td {
        border: 1px solid #ccc;
    }
    th {
      font-weight: 600;
    }
    th, td {
      padding: 8px;
      text-align: left;
      font-size: 14px;
    }
    td img {
      max-width: 180px;
    }
    </style>
  </head>
  <body>
    <h1>Differencify report</h1>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Test name</th>
          <th>Reference</th>
          <th>Difference</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(result => `
          <tr>
            <td>
              ${result.status === 'passed' ? '✅' : '❗'} ${result.status}
            </td>
            <td>
              ${result.testName}
            </td>
            <td>
              ${result.snapshotPath ? `
                <a href="${result.snapshotPath}">
                  <img src="${result.snapshotPath}" />
                </a>
              ` : ''}
            </td>
            <td>
              ${(result.diffPath) ? `
                <a href="${result.diffPath}">
                  <img src="${result.diffPath}" />
                </a>
              ` : ''}
            </td>
        </tr>
      `).join('')}
      </tbody>
    </table>
  </body>
</html>`;
