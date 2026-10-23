import { useState } from "react"

const FormularioMovimentacao = ({ onAdicionar }) => {
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [tipo, setTipo] = useState("receita")

  const handleSubmit = (evento) => {
    evento.preventDefault()

    const valorNumerico = Number(valor)

    if (!descricao.trim() || !valor || valorNumerico <= 0) {
      alert("Preencha a descrição e informe um valor maior que zero.")
      return
    }

    onAdicionar({
      id: crypto.randomUUID(),
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
    })

    setDescricao("")
    setValor("")
    setTipo("receita")
  }

  return (
    <form className="form-movimentacao" onSubmit={handleSubmit}>
      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <input
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

export { FormularioMovimentacao }
