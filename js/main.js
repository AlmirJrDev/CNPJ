  const form = document.querySelector('#cnpj-form');
  const resultDiv = document.querySelector('#result');

  // Obtém o CNPJ a partir do campo de entrada ou da URL
  const searchParams = new URLSearchParams(window.location.search);
  const cnpjInputValue = document.querySelector('#cnpj-input').value;
  const cnpj = searchParams.get('cnpj') || cnpjInputValue.replace(/\D/g, '');

  // Se houver um CNPJ na URL, atualiza o campo de entrada com o valor da URL
  if (searchParams.has('cnpj')) {
    document.querySelector('#cnpj-input').value = cnpj;
  }

  // Busca as informações do CNPJ
  getDataFromAPI(cnpj); 

  form.addEventListener('submit', event => {
    event.preventDefault();

    const cnpjInput = document.querySelector('#cnpj-input');
    const cnpj = cnpjInput.value.replace(/\D/g, '');

    // Atualiza a URL com o novo valor de CNPJ
    searchParams.set('cnpj', cnpj);
    history.replaceState(null, '', `?${searchParams.toString()}`);

    // Busca as informações do CNPJ
    getDataFromAPI(cnpj);
  });

  const priceFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const dataFormatter = new Intl.DateTimeFormat('pt-BR')

  async function getDataFromAPI(cnpj) {
    const url = `https://publica.cnpj.ws/cnpj/${cnpj}`;
    const options = { method: 'GET', mode: 'cors' };

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json()
        displayResult(data);
      } else {
        throw new Error('Não foi possível obter os dados.');
      }
    } catch (error) {
      if (error.message.includes('429')) {
        resultDiv.textContent = 'O limite de requisições foi atingido. Tente novamente mais tarde.';
      } else if (error.message.includes('402')) {
        resultDiv.textContent = 'Pagamento necessário. Entre em contato com o suporte.';
      } else if (error.message.includes('400')) {
        resultDiv.textContent = 'A requisição não foi processada corretamente. Verifique os dados informados.';
      } else {
        console.error(error);
        resultDiv.textContent = '';
      }
    }
  }

  function displayResult(data) {
    const html = `
      <h1>Informações de Registro</h1>
      <p>CNPJ: <strong>${data.estabelecimento.cnpj ?? 'Não disponível'} / ${(data.estabelecimento.cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") ?? 'Não disponível' }</strong></p>
      <p>Razão Social: ${data.razao_social ?? 'Não disponível'}</p>
      <p>Nome Fantasia: <strong>${data.estabelecimento.nome_fantasia ?? 'Não disponível'}</strong></p>
      
      <p>Data de Abertura: <strong>${data.estabelecimento.data_inicio_atividade ? dataFormatter.format(new Date(data.estabelecimento.data_inicio_atividade)) : 'Não disponível'}</strong></p>
          
      <p>Natureza Júridica: <strong>${data.natureza_juridica?.descricao ?? 'Não disponível'}</strong></p>
      <p>Capital Social: <strong>${data.capital_social ? priceFormatter.format(data.capital_social) : 'Não disponível'}</strong></p>
      <p>Tipo: <strong>${data.estabelecimento.tipo ?? 'Não disponível'}</strong></p>
      <p>Situação: <strong>${data.estabelecimento .situacao_cadastral ?? 'Não disponível'}</strong></p>
      <p>Data Situação Cadastral: <strong>${data.estabelecimento.data_situacao_cadastral ? dataFormatter.format(new Date(data.estabelecimento.data_situacao_cadastral)) : 'Não disponível'}</strong></p>

      <p>Endereço: <strong>${data.estabelecimento.logradouro ?? 'Não disponível'}, ${data.estabelecimento.numero ?? 'Não disponível'} - ${data.estabelecimento.bairro ?? 'Não disponível'}</strong></p>
      <p>Cidade: <strong>${data.estabelecimento.cidade?.nome ?? 'Não disponível'} - ${data.estabelecimento.estado?.nome ?? 'Não disponível'}</strong></p>
      <p>CEP: <strong>${(data.estabelecimento.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2') ?? 'Não disponível'}</strong></p>
      <p>Email: <strong>${data.estabelecimento.email ?? 'Não disponível'}</strong></p>     
      

    `;

    resultDiv.innerHTML = html;
  }


