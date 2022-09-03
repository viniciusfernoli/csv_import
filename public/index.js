const tittleTransaction = document.getElementById('titleTransaction');
const tableTransactions = document.getElementById('divTableTransactions');
const formulario = document.querySelector('form');

async function getTransactions() {
  const url = '/allTransaction';
  const response = await fetch(url);
  const data = await response.json();

  while (tableTransactions.firstChild) {
    tableTransactions.removeChild(tableTransactions.firstChild);
  }

  if (data.length > 0) {
    tittleTransaction.innerHTML = 'Importações realizadas';
    const colunas = ['Data da Transação', 'Data da Importação'];
    const table = document.createElement('table');
    table.className =
      'table-auto border-separate border border-slate-500 w-full text-center';
    const thead = document.createElement('thead');
    const newRow = document.createElement('tr');
    colunas.forEach(col => {
      const newCell = document.createElement('th');
      newCell.innerHTML = col;
      newCell.className = 'bg-blue-100';
      newRow.append(newCell);
    });
    thead.append(newRow);
    table.append(thead);
    tableTransactions.append(table);

    for (let i = 0; i < data.length; i++) {
      const newBodyRow = document.createElement('tr');
      const newDate = document.createElement('td');
      const newCreated = document.createElement('td');
      newDate.innerHTML = dayjs(data[i].date).format('DD/MM/YYYY');
      newCreated.innerHTML = dayjs(data[i].created_at).format(
        'DD/MM/YYYY - HH:mm:ss',
      );
      if (i % 2 === 0) {
        newDate.className = 'bg-blue-100 border border-slate-600';
        newCreated.className = 'bg-blue-100 border border-slate-600';
      } else {
        newDate.className = 'bg-blue-50 border border-slate-600';
        newCreated.className = 'bg-blue-50 border border-slate-600';
      }
      newBodyRow.append(newDate, newCreated);
      table.append(newBodyRow);
    }
  } else {
    alert('Não trouxe nenhum resultado');
  }
}

formulario.addEventListener('submit', async event => {
  event.preventDefault();
  const url = '/upload';
  const formData = new FormData(formulario);
  const result = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const dataJSON = await result.json();
  if (!dataJSON.status) {
    alert(dataJSON.response);
  }
  await getTransactions();
});

// formulario.addEventListener('formdata', f => {
//   const formdata = f.formData;
//   return [...formdata.values()];
// });
