import { useEffect, useRef, useState } from "react"
import { CardResumo } from "./components/CardResumo.jsx"
import { FormularioMovimentacao } from "./components/FormularioMovimentacao.jsx"

const formatarData = (data) => {
  const [ano, mes, dia] = data.slice(0, 10).split("-")

  return `${dia}/${mes}/${ano}`
}

const App = () => {
  const [modalLimpezaAberto, setModalLimpezaAberto] = useState(false)
  const [movimentacaoEditando, setMovimentacaoEditando] = useState(null)
  const [notificacao, setNotificacao] = useState(null)
  const [tipoNotificacao, setTipoNotificacao] = useState("sucesso")
  const [movimentacoes, setMovimentacoes] = useState([])
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const campoDescricaoRef = useRef(null)

  const movimentacoesFiltradas = movimentacoes.filter((movimentacao) => {
    if (filtroTipo === "todos") return true

    return movimentacao.tipo === filtroTipo
  })

  useEffect(() => {
    const carregarMovimentacoes = async () => {
      try {
        const resposta = await fetch("http://localhost:3000/movimentacoes")

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar as movimentações.")
        }

        const dados = await resposta.json()

        setMovimentacoes(
          dados.map((movimentacao) => ({
            ...movimentacao,
            valor: Number(movimentacao.valor),
          })),
        )
      } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro)
      }
    }

    carregarMovimentacoes()
  }, [])

  const mostrarNotificacao = (mensagem, tipo = "sucesso") => {
    setNotificacao(mensagem)
    setTipoNotificacao(tipo)

    setTimeout(() => {
      setNotificacao(null)
    }, 3000)
  }

  const receitas = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "receita")
    .reduce((total, movimentacao) => total + movimentacao.valor, 0)

  const despesas = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === "despesa")
    .reduce((total, movimentacao) => total + movimentacao.valor, 0)

  const saldo = receitas - despesas

  const adicionarMovimentacao = async (novaMovimentacao) => {
    try {
      const resposta = await fetch("http://localhost:3000/movimentacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaMovimentacao),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível salvar a movimentação.")
      }

      setMovimentacoes((listaAtual) => [
        ...listaAtual,
        {
          ...dados,
          valor: Number(dados.valor),
        },
      ])

      mostrarNotificacao("Movimentação cadastrada com sucesso!")
    } catch (erro) {
      console.error("Erro ao salvar movimentação:", erro)
      mostrarNotificacao(
        erro.message || "Erro ao conectar com o servidor.",
        "erro",
      )
    }
  }

  const excluirMovimentacao = async (id) => {
    try {
      const resposta = await fetch(
        `http://localhost:3000/movimentacoes/${id}`,
        {
          method: "DELETE",
        },
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível excluir a movimentação.",
        )
      }

      setMovimentacoes((listaAtual) =>
        listaAtual.filter((movimentacao) => movimentacao.id !== id),
      )
    } catch (erro) {
      console.error("Erro ao excluir movimentação:", erro)
      alert(erro.message || "Erro ao conectar com o servidor.")
    }
  }

  const salvarEdicao = async (evento) => {
    evento.preventDefault()

    const formulario = new FormData(evento.currentTarget)

    const movimentacaoAtualizada = {
      descricao: formulario.get("descricao").trim(),
      valor: Number(formulario.get("valor")),
      tipo: formulario.get("tipo"),
      data: formulario.get("data"),
    }

    try {
      const resposta = await fetch(
        `http://localhost:3000/movimentacoes/${movimentacaoEditando.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(movimentacaoAtualizada),
        },
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível atualizar a movimentação.",
        )
      }

      setMovimentacoes((listaAtual) =>
        listaAtual.map((movimentacao) =>
          movimentacao.id === dados.id
            ? { ...dados, valor: Number(dados.valor) }
            : movimentacao,
        ),
      )

      setMovimentacaoEditando(null)
    } catch (erro) {
      console.error("Erro ao editar movimentação:", erro)
      alert(erro.message || "Erro ao conectar com o servidor.")
    }
  }

  const limparMovimentacoes = () => {
    setModalLimpezaAberto(true)
  }

  const irParaNovaMovimentacao = () => {
    campoDescricaoRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })

    campoDescricaoRef.current?.focus()
  }

  const confirmarLimpeza = async () => {
    try {
      const resposta = await fetch("http://localhost:3000/movimentacoes", {
        method: "DELETE",
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível limpar as movimentações.",
        )
      }

      setMovimentacoes([])
      setModalLimpezaAberto(false)

      mostrarNotificacao(
        `${dados.quantidadeExcluida} movimentação(ões) excluída(s) com sucesso!`,
      )
    } catch (erro) {
      console.error("Erro ao limpar movimentações:", erro)

      mostrarNotificacao(
        erro.message || "Erro ao conectar com o servidor.",
        "erro",
      )
    }
  }

  return (
    <main className="dashboard">
      {notificacao && (
        <div
          className={`notificacao ${tipoNotificacao}`}
          role="status"
          aria-live="polite"
        >
          {notificacao}
        </div>
      )}
      <header className="header">
        <div>
          <p className="eyebrow">FINANÇAS PESSOAIS</p>
          <h1>Meu Financeiro</h1>
          <p className="subtitle">Acompanhe seu dinheiro com mais clareza.</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="button-primary"
            onClick={irParaNovaMovimentacao}
          >
            + Nova movimentação
          </button>

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

        <FormularioMovimentacao
          onAdicionar={adicionarMovimentacao}
          onNotificar={mostrarNotificacao}
          campoDescricaoRef={campoDescricaoRef}
        />
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
          <>
            <div className="transaction-filters">
              <button
                type="button"
                className={filtroTipo === "todos" ? "active" : ""}
                onClick={() => setFiltroTipo("todos")}
              >
                Todas
              </button>

              <button
                type="button"
                className={filtroTipo === "receita" ? "active" : ""}
                onClick={() => setFiltroTipo("receita")}
              >
                Receitas
              </button>

              <button
                type="button"
                className={filtroTipo === "despesa" ? "active" : ""}
                onClick={() => setFiltroTipo("despesa")}
              >
                Despesas
              </button>
            </div>

            {movimentacoesFiltradas.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">↗</span>
                <h3>
                  {filtroTipo === "receita"
                    ? "Nenhuma receita encontrada"
                    : "Nenhuma despesa encontrada"}
                </h3>
                <p>Não há movimentações desse tipo no momento.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {movimentacoesFiltradas.map((movimentacao) => (
                  <div className="transaction-item" key={movimentacao.id}>
                    <div>
                      <h3>{movimentacao.descricao}</h3>
                      <span>
                        {movimentacao.tipo === "receita"
                          ? "Receita"
                          : "Despesa"}
                      </span>
                      <span className="data-movimentacao">
                        {formatarData(movimentacao.data)}
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
                        className="button-cancel"
                        onClick={() => setMovimentacaoEditando(movimentacao)}
                      >
                        Editar
                      </button>

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
          </>
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
                onClick={confirmarLimpeza}
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {movimentacaoEditando && (
        <div
          className="modal-overlay"
          onClick={() => setMovimentacaoEditando(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-edicao"
            onClick={(evento) => evento.stopPropagation()}
          >
            <h2 id="titulo-edicao">Editar movimentação</h2>

            <form onSubmit={salvarEdicao}>
              <div className="campo">
                <label htmlFor="edicao-descricao">Descrição</label>
                <input
                  id="edicao-descricao"
                  name="descricao"
                  type="text"
                  defaultValue={movimentacaoEditando.descricao}
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="edicao-valor">Valor (R$)</label>
                <input
                  id="edicao-valor"
                  name="valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  defaultValue={movimentacaoEditando.valor}
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="edicao-tipo">Tipo de movimentação</label>
                <select
                  id="edicao-tipo"
                  name="tipo"
                  defaultValue={movimentacaoEditando.tipo}
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              <div className="campo">
                <label htmlFor="edicao-data">Data da movimentação</label>
                <input
                  id="edicao-data"
                  name="data"
                  type="date"
                  defaultValue={String(movimentacaoEditando.data).slice(0, 10)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-cancel"
                  onClick={() => setMovimentacaoEditando(null)}
                >
                  Cancelar
                </button>

                <button type="submit" className="button-confirm">
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <button
        type="button"
        className="botao-flutuante"
        onClick={irParaNovaMovimentacao}
        aria-label="Ir para nova movimentação"
        title="Nova movimentação"
      >
        +
      </button>
    </main>
  )
}

export { App }
