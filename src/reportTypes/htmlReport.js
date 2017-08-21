export default files =>
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
          <th>Test name</th>
          <th>Reference</th>
          <th>Difference</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
        ${files.map(file => `
          <tr>
            <td>
              ${file.testName}
            </td>
            <td>
              ${file.referenceFileName ? `
                <a href="${file.referenceFileName}">
                  <img src="${file.referenceFileName}" />
                </a>
              ` : ''}
            </td>
            <td>
              ${(file.diffFileName) ? `
                <a href="${file.diffFileName}">
                  <img src="${file.diffFileName}" />
                </a>
              ` : ''}
            </td>
            <td>
              ${file.result}
            </td>
        </tr>
      `).join('')}
      </tbody>
    </table>
  </body>
</html>`;
