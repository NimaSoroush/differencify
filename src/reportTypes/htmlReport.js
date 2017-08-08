export default files =>
`<html>
  <head>
    <title>Differencify report</title>
    <style type="text/css">
    table {
      border-collapse: collapse;
    }
    table, th, td {
        border: 1px solid #ccc;
    }
    th, td {
      padding: 5px;
      text-align: left;
    }
    </style>
  </head>
  <body>
    <h1>Differencify report</h1>
    <table>
      <thead>
        <tr>
          <th>Filename</th>
          <th>Outcome</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        ${files.map(file => `
          <tr>
            <td>
              <a href="${file.fileName}">
                ${file.fileName}
              </a>
            </td>
            <td>${file.outcome ? 'Pass' : 'Fail'}</td>
            <td>
              ${file.message}
              ${file.diff ? `
                <a href="${file.diff}">
                  View diff
                </a>` : ''
              }
            </td>
        </tr>
      `).join('')}
      </tbody>
    </table>
  </body>
</html>`;
