const ASSINATURA_XLS = [
  0xd0, 0xcf, 0x11, 0xe0,
  0xa1, 0xb1, 0x1a, 0xe1
];

function comecaCom(bytes, assinatura) {
  return assinatura.every(
    (valor, indice) => bytes[indice] === valor
  );
}

export async function validarEstruturaArquivo(arquivo) {
  if (!arquivo || arquivo.size === 0) {
    return {
      valido: false,
      mensagem: "O arquivo está vazio ou é inválido."
    };
  }

  const extensao = arquivo.name
    .split(".")
    .pop()
    ?.toLowerCase();

  const bytes = new Uint8Array(
    await arquivo.slice(0, 8).arrayBuffer()
  );

  if (extensao === "xlsx") {
    const assinaturaZIP = [0x50, 0x4b, 0x03, 0x04];

    if (!comecaCom(bytes, assinaturaZIP)) {
      return {
        valido: false,
        mensagem: "O arquivo XLSX não possui uma assinatura ZIP válida."
      };
    }
  }

  if (extensao === "xls") {
    if (!comecaCom(bytes, ASSINATURA_XLS)) {
      return {
        valido: false,
        mensagem: "O arquivo XLS possui uma assinatura inválida."
      };
    }
  }

  if (extensao === "csv") {
    const amostra = await arquivo.slice(0, 4096).arrayBuffer();
    const conteudo = new Uint8Array(amostra);

    if (conteudo.includes(0)) {
      return {
        valido: false,
        mensagem: "O arquivo CSV contém dados binários incompatíveis."
      };
    }
  }

  return {
    valido: true,
    mensagem: "Estrutura inicial do arquivo validada."
  };
}