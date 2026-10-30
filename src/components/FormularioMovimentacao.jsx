import { useState } from "react"
import PropTypes from "prop-types"

const obterDataLocal = () => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, "0")
  const dia = String(hoje.getDate()).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

const FormularioMovimentacao = ({
  onAdicionar,
  onNotificar,
  campoDescricaoRef,
}) => {
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState("receita")
  const [data, setData] = useState(obterDataLocal())

  const handleSubmit = (evento) => {
    evento.preventDefault()

    const valorNumerico = Number(valor)

    if (!descricao.trim() || !valor || valorNumerico <= 0) {
      onNotificar(
        "Preencha a descrição e informe um valor maior que zero.",
        "erro",
      )
      return
    }

    onAdicionar({
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      data,
    })

    setDescricao("")
    setValor("")
    setTipo("receita")

    setData(obterDataLocal())
  }

  return (
    <form className="form-movimentacao" onSubmit={handleSubmit}>
      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <input
          ref={campoDescricaoRef}
          id="descricao"
          type="text"
          placeholder="Ex.: Salário, aluguel..."
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="valor">Valor (R$)</label>
        <input
          id="valor"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="data">Data da movimentação</label>
        <input
          id="data"
          type="date"
          value={data}
          onChange={(evento) => setData(evento.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="tipo">Tipo de movimentação</label>
        <select
          id="tipo"
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
      </div>

      <button className="button-primary" type="submit">
        Adicionar movimentação
      </button>
    </form>
  )
}

FormularioMovimentacao.propTypes = {
  onAdicionar: PropTypes.func.isRequired,
  onNotificar: PropTypes.func.isRequired,
  campoDescricaoRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
}

export { FormularioMovimentacao }
