import * as XLSX from "xlsx";

// Converte valores para texto sem espaços extras.
function texto(valor) {
  return valor === null || valor === undefined
    ? ""
    : String(valor).trim();
}

// Converte faturamentos em formatos numéricos e monetários.
// Exemplos:
// 125000          -> 125000
// 125000.75       -> 125000.75
// 125.000,75      -> 125000.75
// R$ 125.000,75   -> 125000.75
// -R$ 1.500,00    -> -1500
//
// Valores inválidos permanecem como texto para que
// a validação original possa identificá-los.
function converterFaturamento(valorOriginal) {
  if (
    valorOriginal === null ||
    valorOriginal === undefined
  ) {
    return "";
  }

  if (typeof valorOriginal === "number") {
    return Number.isFinite(valorOriginal)
      ? valorOriginal
      : valorOriginal;
  }

  if (typeof valorOriginal !== "string") {
    return valorOriginal;
  }

  const original = valorOriginal.trim();

  if (original === "") {
    return "";
  }

  // Remove espaços comuns e não separáveis.
  let valor = original.replace(/[\s\u00A0\u202F]/g, "");

  // Aceita sinal negativo antes ou depois de R$.
  let negativo = false;

  if (valor.startsWith("-")) {
    negativo = true;
    valor = valor.slice(1);
  }

  if (/^R\$/i.test(valor)) {
    valor = valor.slice(2);
  }

  if (valor.startsWith("-") && !negativo) {
    negativo = true;
    valor = valor.slice(1);
  }

  // Não aceita símbolos, letras ou sinais extras.
  if (!/^[0-9.,]+$/.test(valor)) {
    return original;
  }

  const formatoInteiro = /^\d+$/;

  const formatoDecimalVirgula = /^\d+,\d{1,2}$/;
  const formatoDecimalPonto = /^\d+\.\d{1,2}$/;

  const formatoBrasil =
    /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/;

  const formatoInternacional =
    /^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/;

  let normalizado;

  if (formatoInteiro.test(valor)) {
    normalizado = valor;
  } else if (formatoDecimalVirgula.test(valor)) {
    normalizado = valor.replace(",", ".");
  } else if (formatoDecimalPonto.test(valor)) {
    normalizado = valor;
  } else if (formatoBrasil.test(valor)) {
    normalizado = valor
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (formatoInternacional.test(valor)) {
    normalizado = valor.replace(/,/g, "");
  } else {
    return original;
  }

  const convertido = Number(normalizado);

  if (!Number.isFinite(convertido)) {
    return original;
  }

  return negativo ? -convertido : convertido;
}

// Padroniza os dados de cada cliente.
function tratarLinha(linha) {
  const dados = { ...linha };

  dados.codigo_cliente = texto(
    dados.codigo_cliente
  ).toUpperCase();

  dados.nome_cliente = texto(dados.nome_cliente);
  dados.consultor = texto(dados.consultor);

  dados.nivel_cliente = texto(
    dados.nivel_cliente
  ).toUpperCase();

  dados.cidade = texto(dados.cidade);
  dados.uf = texto(dados.uf).toUpperCase();

  dados.servicos_contratados = texto(
    dados.servicos_contratados
  );

  // Padronização dos segmentos.
  const segmentoOriginal = texto(dados.segmento);

  const segmentoNormalizado = segmentoOriginal
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  const mapaSegmentos = {
    "IND.": "Indústria",
    INDUSTRIA: "Indústria",
    COMERCIO: "Comércio",
    SERVICOS: "Serviços",
    SAUDE: "Saúde",
    EDUCACAO: "Educação",
    TECNOLOGIA: "Tecnologia"
  };

  dados.segmento =
    mapaSegmentos[segmentoNormalizado] ||
    segmentoOriginal;

  // Conversão dinâmica do faturamento anual.
  dados.faturamento_anual = converterFaturamento(
    dados.faturamento_anual
  );

  // Normaliza datas para DD/MM/AAAA.
  const data = dados.data_contratacao;

  if (
    data instanceof Date &&
    !Number.isNaN(data.getTime())
  ) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    dados.data_contratacao = `${dia}/${mes}/${ano}`;
  } else if (
    typeof data === "number" &&
    Number.isFinite(data)
  ) {
    const dataExcel = XLSX.SSF.parse_date_code(data);

    if (dataExcel) {
      const dia = String(dataExcel.d).padStart(2, "0");
      const mes = String(dataExcel.m).padStart(2, "0");
      const ano = dataExcel.y;

      dados.data_contratacao = `${dia}/${mes}/${ano}`;
    }
  } else {
    dados.data_contratacao = texto(data);
  }

  return dados;
}

// Valida todos os registros tratados.
function validarDados(dadosTratados) {
  const dadosValidados = [];
  const dadosInvalidados = [];
  const erros = [];
  const detalhesErros = [];
  const tiposErros = {};

  const codigos = new Set();

  const camposObrigatorios = [
    ["codigo_cliente", "Código do cliente"],
    ["nome_cliente", "Nome do cliente"],
    ["consultor", "Consultor"],
    ["segmento", "Segmento"],
    ["nivel_cliente", "Nível do cliente"],
    ["faturamento_anual", "Faturamento anual"],
    ["servicos_contratados", "Serviços contratados"],
    ["data_contratacao", "Data de contratação"],
    ["cidade", "Cidade"],
    ["uf", "UF"]
  ];

  dadosTratados.forEach((linha, index) => {
    const numeroLinha = index + 2;
    const errosLinha = [];
    const detalhesLinha = [];

    function registrarErro(campo, tipo, descricao) {
      const detalhe = {
        linha: numeroLinha,
        campo,
        tipo,
        descricao
      };

      errosLinha.push(descricao);
      detalhesLinha.push(detalhe);
      detalhesErros.push(detalhe);

      erros.push(
        `Linha ${numeroLinha} — ${campo}: ${descricao}`
      );

      tiposErros[tipo] =
        (tiposErros[tipo] || 0) + 1;
    }

    // Campos obrigatórios.
    camposObrigatorios.forEach(([campo, nomeCampo]) => {
      const valor = linha[campo];

      if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
      ) {
        registrarErro(
          nomeCampo,
          "Campo obrigatório",
          `${nomeCampo} não foi preenchido.`
        );
      }
    });

    // Nível do cliente.
    if (
      linha.nivel_cliente &&
      !["A", "B", "C"].includes(linha.nivel_cliente)
    ) {
      registrarErro(
        "Nível do cliente",
        "Nível inválido",
        "O nível deve ser A, B ou C."
      );
    }

    // Códigos duplicados.
    const codigo = String(
      linha.codigo_cliente || ""
    )
      .trim()
      .toUpperCase();

    if (codigo) {
      if (codigos.has(codigo)) {
        registrarErro(
          "Código do cliente",
          "Código duplicado",
          `O código ${codigo} já apareceu em outro registro.`
        );
      } else {
        codigos.add(codigo);
      }
    }

    // Faturamento anual.
    const faturamento = linha.faturamento_anual;

    if (
      faturamento !== "" &&
      faturamento !== null &&
      faturamento !== undefined
    ) {
      if (
        typeof faturamento !== "number" ||
        !Number.isFinite(faturamento)
      ) {
        registrarErro(
          "Faturamento anual",
          "Faturamento inválido",
          "O faturamento deve ser um número válido."
        );
      } else if (faturamento < 0) {
        registrarErro(
          "Faturamento anual",
          "Faturamento inválido",
          "O faturamento não pode ser negativo."
        );
      }
    }

    // Data de contratação.
    const data = String(
      linha.data_contratacao || ""
    ).trim();

    if (data) {
      const correspondencia = data.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
      );

      if (correspondencia) {
        const dia = Number(correspondencia[1]);
        const mes = Number(correspondencia[2]);
        const ano = Number(correspondencia[3]);

        const dataTeste = new Date(ano, mes - 1, dia);

        const dataValida =
          dataTeste.getFullYear() === ano &&
          dataTeste.getMonth() === mes - 1 &&
          dataTeste.getDate() === dia;

        if (!dataValida) {
          registrarErro(
            "Data de contratação",
            "Data inválida",
            "A data informada não existe no calendário."
          );
        }
      } else {
        registrarErro(
          "Data de contratação",
          "Data inválida",
          "Utilize o formato DD/MM/AAAA."
        );
      }
    }

    // UF.
    if (
      linha.uf &&
      !/^[A-Z]{2}$/.test(linha.uf)
    ) {
      registrarErro(
        "UF",
        "UF inválida",
        "A UF deve conter duas letras."
      );
    }

    if (errosLinha.length === 0) {
      dadosValidados.push(linha);
    } else {
      dadosInvalidados.push({
        ...linha,
        linhaPlanilha: numeroLinha,
        erros: errosLinha,
        detalhesErros: detalhesLinha
      });
    }
  });

  const statusValidacao =
    dadosInvalidados.length === 0
      ? "Validação concluída com sucesso."
      : "Arquivo possui inconsistências.";

  return {
    dadosValidados,
    dadosInvalidados,
    erros,
    detalhesErros,
    tiposErros,
    statusValidacao
  };
}

// Lê e processa a planilha no Worker.
function processarPlanilha(buffer) {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    WTF: true
  });

  if (workbook.SheetNames.length === 0) {
    return {
      sucesso: false,
      mensagem: "A planilha não possui abas para leitura.",
      statusValidacao: "Planilha sem abas para leitura."
    };
  }

  // Prioriza a aba upload_clientes.
  const nomeAba = workbook.SheetNames.includes(
    "upload_clientes"
  )
    ? "upload_clientes"
    : workbook.SheetNames[0];

  const planilha = workbook.Sheets[nomeAba];

  const linhas = XLSX.utils.sheet_to_json(
    planilha,
    {
      defval: "",
      raw: true,
      blankrows: false
    }
  );

  if (linhas.length === 0) {
    return {
      sucesso: false,
      mensagem: "A planilha não contém registros para validar.",
      statusValidacao: "Nenhum registro encontrado."
    };
  }

  const dadosOriginais = linhas;
  const dadosTratados = linhas.map(tratarLinha);

  const resultadoValidacao = validarDados(dadosTratados);

  return {
    sucesso: true,
    dadosOriginais,
    dadosTratados,
    ...resultadoValidacao
  };
}

// Comunicação com a aplicação Vue/Pinia.
self.onmessage = (evento) => {
  const { tipo, buffer } = evento.data ?? {};

  // Mantém compatibilidade com o teste anterior.
  if (tipo === "TESTAR_WORKER") {
    self.postMessage({
      tipo: "WORKER_PRONTO",
      mensagem: "Web Worker funcionando corretamente!"
    });

    return;
  }

  if (tipo !== "PROCESSAR_PLANILHA") {
    return;
  }

  try {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error(
        "O conteúdo enviado para processamento é inválido."
      );
    }

    const resultado = processarPlanilha(buffer);

    self.postMessage({
      tipo: "PROCESSAMENTO_CONCLUIDO",
      resultado
    });
  } catch (error) {
    self.postMessage({
      tipo: "ERRO_PROCESSAMENTO",
      mensagem:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar a planilha."
    });
  }
};