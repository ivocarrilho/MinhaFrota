
    document.addEventListener('DOMContentLoaded', () => {

    const IP = "52.38.87.209"; //IP ou URL do servidor

    // Formulario
    const openFormButton  = document.getElementById('open-form-popup');
    const generationPdf   = document.getElementById('generation-pdf');

    document.getElementById('nome').value = document.getElementById('usuario').textContent.trim();

    openFormButton.addEventListener('click', function() {
        // Criando um novo objeto Date, que inicializa com a data e hora atuais
        let dataAtual = new Date();
        // Formatando a data no formato adequado para o input date (AAAA-MM-DD)
        let ano = dataAtual.getFullYear();
        let mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Meses são zero-indexed
        let dia = dataAtual.getDate().toString().padStart(2, '0');
        let dataFormatada = `${ano}-${mes}-${dia}`;

        // Formatando a hora no formato adequado para o input time (HH:mm)
        let hora = dataAtual.getHours().toString().padStart(2, '0');
        let minutos = dataAtual.getMinutes().toString().padStart(2, '0');
        let horaFormatada = `${hora}:${minutos}`;
      
        // Atribuindo a data formatada ao input date
        document.getElementById('dataini').value = dataFormatada;
        document.getElementById('datafin').value = dataFormatada;

        // Atribuindo a hora formatada ao input time
        document.getElementById('horaini').value = horaFormatada;
    });

    // Tabela
    const produtosTable = document.getElementById('produtos-body');
    const filtroNome = document.getElementById('filtro-nome');
    const paginationContainer = document.querySelector('.pagination');
    const Filtro = document.getElementById('filtro');
    const filtroDateini = document.getElementById('filtro_dateini');

    let currentPage = 1; // Página inicial
    let produtos = []; // Array para armazenar todos os produtos
    let itensPorPagina = 20; // Quantidade de itens por página

    function carregarProdutos(campo, valor) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        produtos = JSON.parse(this.responseText);
                        // console.log(produtos);
                        atualizarTabela(produtos); // Carrega os produtos na tabela

                        // Inicializar variável para a soma dos kmpercorridos
                        let somaKm = 0;
                        // Iterar pelo array e somar os valores de kmpercorrido
                        produtos.forEach(objeto => {
                            somaKm += parseInt(objeto.kmpercorrido); // converte o texto em inteiro
                        });
                        // Resultado
                        // console.log('A soma dos km percorridos é:', somaKm);
                        document.getElementById('totalope').innerHTML = produtos.length;
                        document.getElementById('totalkm').innerHTML = somaKm + ' km';

                    } catch (error) {
                        console.error('Erro ao processar resposta JSON:', error);
                    }
                } else {
                    console.error('Erro ao carregar:', this.status);
                }
            }
        };
        
        let url = '';

        if (valor != null ) url = 'http://' + IP + ':3000/produtos/buscar?campo=' + campo + '&valor=' + valor;
        else url = 'http://' + IP + ':3000/produtos/';   

        xhr.open('GET', url, true);
        xhr.send();
    }

    // Função para atualizar a tabela com os produtos
    function atualizarTabela(produtos) {
        produtosTable.innerHTML = ''; // Limpa a tabela antes de preencher
    
        const totalProdutos = produtos.length; // Total de produtos
        const totalPaginas = Math.ceil(totalProdutos / itensPorPagina); // Calcula o total de páginas

        // Verifica se a página atual é maior que o total de páginas após a atualização
        if (currentPage > totalPaginas && totalPaginas > 0) {
            currentPage = totalPaginas; // Define a página atual para a última página existente
        }

        // Variáveis para controle de páginas
        const inicio = (currentPage - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
    
        // Itera sobre os produtos e cria as linhas da tabela para a página atual
        produtos.slice(inicio, fim).forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.dataini}</td>
                <td>${produto.datafin}</td>
                <td>${produto.nome}</td>
                <td>${produto.carro}</td>
                <td>${produto.horaini}</td>
                <td>${produto.horafin}</td>
                <td>${produto.kmini}</td>
                <td>${produto.kmfin}</td>
                <td>${produto.kmpercorrido}</td>
                <td>${produto.destino}</td>
                <td>${produto.observacao}</td>
                <td class="actions">
                    <button class="btn-editar" onclick="editarProduto(${produto.id})">Finalizar</button>
                    <button class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
                </td>
            `;
            produtosTable.appendChild(row);
        });

        // Atualiza os controles de paginação
        atualizarControlesPaginacao(totalPaginas);
    }

    // Função para atualizar os controles de navegação entre páginas
    function atualizarControlesPaginacao(totalPaginas) {
        paginationContainer.innerHTML = ''; // Limpa os botões de navegação

        // Cria botões para cada página
        for (let i = 1; i <= totalPaginas; i++) {
            const button = document.createElement('button');
            button.textContent = `${i}`;
            button.onclick = function() {
                mostrarPagina(i);
            };
            paginationContainer.appendChild(button);
        }
    }

    function mostrarPagina(numeroPagina) {
        currentPage = numeroPagina; 
        atualizarTabela(produtos); // Atualiza a tabela para exibir os produtos da nova página
    }
    
    // Função para formatar a data no padrão brasileiro (dd/mm/aaaa)
    function formatarDataBrasileiro(data) {
        var partes = data.split('-'); // Divide a string da data pelo caractere "-"
        var ano = partes[0];
        var mes = partes[1];
        var dia = partes[2];
        return dia + '/' + mes + '/' + ano;
    }

    // Função para adicionar um novo produto
    const form = document.getElementById('produto-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Criar um objeto Date a partir da string ISO
        const dataini = formatarDataBrasileiro(document.getElementById('dataini').value);   
        const datafin = formatarDataBrasileiro(document.getElementById('datafin').value); 
          
        const nome         = document.getElementById('nome').value;
        const carro        = document.getElementById('carro').value;
        const horaini      = document.getElementById('horaini').value;
        const horafin      = document.getElementById('horafin').value;
        const kmini        = document.getElementById('kmini').value;
        const kmfin        = document.getElementById('kmfin').value;
        const destino      = document.getElementById('destino').value;
        const observacao   = document.getElementById('observacao').value;

        let kmpercorrido = kmfin - kmini;

        if(kmfin != ''){          
            if(kmpercorrido < 0) {
                alert('ERRO - Km Final menor que o Km Inicial!');
                return;
            }                    
        }
        else{
            kmpercorrido = 0;
        }

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    carregarProdutos(); // Atualiza a lista de produtos após adicionar um novo
                    form.reset(); // Limpa o formulário após a adição
                    alert('Adicionado com Sucesso!');
                    $('#form-popup').modal('hide'); // Esconde o modal usando jQuery
                    document.getElementById('nome').value = document.getElementById('usuario').textContent.trim();
                } else {
                    console.error('Erro ao adicionar produto:', this.status);
                }
            }
        };

        xhr.open('POST', 'http://' + IP + ':3000/produtos', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            dataini,
            datafin,
            nome,
            carro,
            horaini,
            horafin,
            kmini,
            kmfin,
            kmpercorrido,
            destino,
            observacao
        }));
    });

    // Função para editar um produto
    window.editarProduto = function(id) {

        // Criando um novo objeto Date, que inicializa com a data e hora atuais
        let dataAtual = new Date();
        // Convertendo a data para uma string legível
        let dataFormatada = dataAtual.toLocaleDateString(); // Formato padrão dependente do ambiente

        // Obtendo componentes de hora
        let hora    = dataAtual.getHours();
        let minuto  = dataAtual.getMinutes();

        // Adicionando zero à esquerda se necessário
        if (hora < 10) {
            hora = `0${hora}`;
        }
        if (minuto < 10) {
            minuto = `0${minuto}`;
        }

        // Formatando para exibição
        let horaFormatada = `${hora}:${minuto}`;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const produto = JSON.parse(this.responseText);
          
                    if(produto.datafin == '' || produto.horafin == '' || produto.kmfin == '') {
                            // Simulando edição no próprio campo
                        // const dataini = prompt('Nova Data Inicial:', produto.dataini);
                        // const datafin = prompt('Nova Data Final:', produto.datafin);
                        // const nome    = prompt('Novo Nome:', produto.nome);
                        // const carro   = prompt('Novo Carro:', produto.carro);
                        // const horaini = prompt('Novo Horario Inicial:', produto.horaini);
                        // const horafin = prompt('Novo Horario Final:', produto.horafin);
                        // const kmini   = prompt('Novo Km Inicial:', produto.kmini);
                        const kmfin      = prompt('Novo Km Final:', produto.kmfin);
                                  
                        // Convertendo o valor para um número inteiro (caso seja válido)
                        let kminiInt = parseInt(produto.kmini);
                        let kmfinInt = parseInt(kmfin);

                        // Verificando se o valor inserido é um número válido
                        if (isNaN(kmfinInt)) {
                            // Aqui você pode usar o novoKmFinal, que é um número inteiro
                            alert('ERRO - O valor não é Número');
                            return;
                        } 

                        if(kmfinInt < kminiInt || kmfin == '') {
                            alert('ERRO - Km Final menor que o Km Inicial!');
                            return;
                        }

                        const observacao = prompt('Nova Observação:', produto.observacao);
                      
                        const updatedProduto = {
                            dataini: produto.dataini,
                            // datafin: datafin || produto.datafin,
                            datafin: dataFormatada, //salva data atual
                            nome: produto.nome,
                            carro: produto.carro,
                            horaini: produto.horaini,
                            // horafin: horafin || produto.horafin,
                            horafin: horaFormatada, // salva hora atual
                            kmini: produto.kmini,
                            kmfin: kmfin || produto.kmfin,
                            destino: produto.destino,
                            kmpercorrido: kmfinInt - kminiInt,
                            observacao: observacao || produto.observacao
                        };

                        const xhrUpdate = new XMLHttpRequest();
                        xhrUpdate.onreadystatechange = function() {
                            if (this.readyState === 4) {
                                if (this.status === 200) {
                                    carregarProdutos(); // Atualiza a lista de produtos após editar
                                    alert('Viagem finalizada com sucesso!');
                                } else {
                                    console.error('Erro ao editar produto:', this.status);
                                }
                            }
                        };

                        xhrUpdate.open('PUT', `http://${IP}:3000/produtos/${id}`, true);
                        xhrUpdate.setRequestHeader('Content-Type', 'application/json');
                        xhrUpdate.send(JSON.stringify(updatedProduto));
                    }
                    else {
                        alert('A Viagem já foi finalizada!');
                    }

                } else {
                    console.error('Erro ao buscar produto para edição:', this.status);
                }
            }
        };

        xhr.open('GET', `http://${IP}:3000/produto/${id}`, true); 
        xhr.send();
    };

    // Função para excluir um produto
    window.excluirProduto = function(id) {
        if (confirm('Tem certeza que deseja excluir esta Viagem?')) {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        carregarProdutos(); // Atualiza a lista de produtos após excluir
                    } else {
                        console.error('Erro ao excluir produto:', this.status);
                    }
                }
            };

            xhr.open('DELETE', `http://${IP}:3000/produtos/${id}`, true);
            xhr.send();
        }
    };

    Filtro.addEventListener('click', function() {
        var select = document.getElementById('filtro');
        var filtroDateini = document.getElementById('filtro_dateini');
        var filtroNome = document.getElementById('filtro-nome');
    
        if (select.value === 'dataini') {
            filtroDateini.style.display = 'block';
            filtroNome.style.display    = 'none';
        } else {
            filtroDateini.style.display = 'none';
            filtroNome.style.display    = 'block';
        }
    });

    filtroDateini.addEventListener('input', function() {
        const campo   = document.getElementById('filtro').value;
        const dateini = formatarDataBrasileiro(document.getElementById('filtro_dateini').value);
        carregarProdutos(campo, dateini);
    });

    // Filtro de produtos por nome
    filtroNome.addEventListener('input', function() {
        const valor   = document.getElementById('filtro-nome').value;
        const campo   = document.getElementById('filtro').value;
          
        if (valor == '') carregarProdutos();
        else carregarProdutos(campo, valor);
          
    });
  
    generationPdf.addEventListener('click', function() {
        
        const textoExtra = '<div style="margin-top: 20px; font-size: 16px;"><h2>Controle de Veículos</h2></div>';
        const element = document.getElementById('produtos-table');

        const opt = {
          margin:       10,
          filename:     'Viagens.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        // Concatenar o texto extra com o conteúdo da tabela
        const conteudoHTML = textoExtra + element.outerHTML;
        
        html2pdf().from(conteudoHTML).set(opt).save();
      
    });

    // Carrega os produtos ao carregar a página inicialmente
    carregarProdutos();


});
