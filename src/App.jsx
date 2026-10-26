import { useEffect, useState } from "react"
import { CardResumo } from "./components/CardResumo.jsx"
import { FormularioMovimentacao } from "./components/FormularioMovimentacao.jsx"

const App = () => {
  const [modalLimpezaAberto, setModalLimpezaAberto] = useState(false)
  const [movimentacoes, setMovimentacoes] = useState(() => {
    const dadosSalvos = localStorage.getItem("movimentacoes")

    return dadosSalvos ? JSON.parse(dadosSalvos) : []
  })

  useEffect(() => {
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes))
  }, [movimentacoes])

  const receitas = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "receita")
    .reduce((total, movimentacao) => total + movimentacao.valor, 0)

  const despesas = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "despesa")
    .reduce((total, movimentacao) => total + movimentacao.valor, 0)

  const saldo = receitas - despesas

  const adicionarMovimentacao = (novaMovimentacao) => {
    setMovimentacoes((listaAtual) => [...listaAtual, novaMovimentacao])
  }

  const excluirMovimentacao = (id) => {
    setMovimentacoes((listaAtual) =>
      listaAtual.filter((movimentacao) => movimentacao.id !== id),
    )
  }

  const limparMovimentacoes = () => {
    setModalLimpezaAberto(true)
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">FINANÇAS PESSOAIS</p>
          <h1>Meu Financeiro</h1>
          <p className="subtitle">Acompanhe seu dinheiro com mais clareza.</p>
        </div>

        <div className="header-actions">
          <button className="button-primary">+ Nova movimentação</button>

          <button
            type="button"
            className="button-delete"
            onClick={limparMovimentacoes}
            disabled={movimentacoes.length === 0}
          >
            Limpar todos os registros
          </button>
        </div>
      </header>

      <section className="transactions">
        <div className="section-heading">
          <div>
            <h2>Nova movimentação</h2>
            <p>Registre uma receita ou uma despesa.</p>
          </div>
        </div>

        <FormularioMovimentacao onAdicionar={adicionarMovimentacao} />
      </section>

      <section className="summary">
        <CardResumo
          titulo="Saldo atual"
          valor={`R$ ${saldo.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          descricao="Seu saldo disponível"
          tipo="balance-card"
        />

        <CardResumo
          titulo="Receitas"
          valor={`R$ ${receitas.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          descricao="Total recebido"
          tipo="income-card"
        />

        <CardResumo
          titulo="Despesas"
          valor={`R$ ${despesas.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          descricao="Total gasto"
          tipo="expense-card"
        />
      </section>

      <section className="transactions">
        <div className="section-heading">
          <div>
            <h2>Movimentações</h2>
            <p>Suas receitas e despesas recentes.</p>
          </div>
        </div>

        {movimentacoes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">↗</span>
            <h3>Nenhuma movimentação ainda</h3>
            <p>Seus registros financeiros aparecerão aqui.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {movimentacoes.map((movimentacao) => (
              <div className="transaction-item" key={movimentacao.id}>
                <div>
                  <h3>{movimentacao.descricao}</h3>
                  <span>
                    {movimentacao.tipo === "receita" ? "Receita" : "Despesa"}
                  </span>
                </div>

                <div className="transaction-actions">
                  <strong className={movimentacao.tipo}>
                    {movimentacao.tipo === "receita" ? "+ " : "- "}
                    {movimentacao.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>

                  <button
                    type="button"
                    className="button-delete"
                    onClick={() => excluirMovimentacao(movimentacao.id)}
                    aria-label={`Excluir ${movimentacao.descricao}`}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalLimpezaAberto && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
          >
            <h2 id="modal-titulo">Limpar movimentações?</h2>

            <p>
              Tem certeza de que deseja apagar todos os registros? Essa ação não
              poderá ser desfeita.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="button-cancel"
                onClick={() => setModalLimpezaAberto(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="button-confirm"
                onClick={() => {
                  setMovimentacoes([])
                  setModalLimpezaAberto(false)
                }}
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export { App }
