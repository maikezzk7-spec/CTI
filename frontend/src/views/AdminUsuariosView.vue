<template>
  <div class="mx-auto w-full max-w-7xl space-y-6 text-white">

    <!-- CABEÇALHO -->
    <div>
      <div class="mb-3 flex items-center gap-2 text-sm text-[#22D3EE]">
        <i class="fa-solid fa-users-gear"></i>
        Painel administrativo
      </div>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Administração de Usuários
      </h1>

      <p class="mt-2 text-slate-400">
        Gerencie cadastros, acompanhe solicitações e controle
        o acesso dos usuários ao CTI Insights.
      </p>
    </div>

    <!-- INDICADORES -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(card, index) in indicadores"
        :key="card.titulo"
        class="card-indicador rounded-2xl border border-white/10 bg-[#18263E] p-4"
        :style="{ animationDelay: `${index * 90}ms` }"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="pt-1 text-sm text-slate-400">
            {{ card.titulo }}
          </p>

          <div
            class="icone-indicador flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            :class="card.fundo"
          >
            <i :class="[card.icone, card.cor]" class="text-lg"></i>
          </div>
        </div>

        <p
          class="mt-2 text-3xl font-extrabold tracking-tight"
          :class="card.cor"
        >
          {{ card.valor }}
        </p>

        <p class="mt-3 text-xs text-slate-400">
          {{ card.descricao }}
        </p>
      </div>
    </div>

    <!-- LISTAGEM -->
    <section
      class="overflow-hidden rounded-2xl border border-white/10 bg-[#18263E]"
    >
      <div class="border-b border-white/10 p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold">
              Usuários cadastrados
            </h2>

            <p class="mt-1 text-sm text-slate-400">
              Consulte os usuários e gerencie suas permissões.
            </p>
          </div>

          <button
            type="button"
            :disabled="carregando || alterando || redefinindoSenha || promovendo"
            class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            @click="carregarUsuarios"
          >
            <i
              class="fa-solid fa-rotate"
              :class="{ 'fa-spin': carregando }"
            ></i>
            Atualizar
          </button>
        </div>

        <!-- PESQUISA E FILTRO -->
        <div class="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            ></i>

            <input
              v-model="pesquisa"
              type="search"
              placeholder="Pesquisar por nome ou e-mail..."
              class="w-full rounded-xl border border-white/10 bg-[#0B1220] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#06B6D4]"
            />
          </div>

          <!-- DROPDOWN PERSONALIZADO -->
          <div ref="dropdownStatusRef" class="relative">
            <button
              type="button"
              aria-label="Filtrar usuários por status"
              aria-haspopup="listbox"
              :aria-expanded="dropdownAberto"
              class="flex w-full items-center justify-between rounded-xl border bg-[#0B1220] px-4 py-3 text-left text-sm text-white transition-all hover:border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              :class="dropdownAberto ? 'border-cyan-400/60' : 'border-white/10'"
              @click="alternarDropdown"
              @keydown.esc.stop="fecharDropdown"
              @keydown.down.prevent="abrirDropdownPeloTeclado"
              @keydown.up.prevent="abrirDropdownPeloTeclado"
            >
              <span>{{ rotuloFiltroStatus }}</span>

              <i
                class="fa-solid fa-chevron-down text-xs text-cyan-400 transition-transform duration-200"
                :class="{ 'rotate-180': dropdownAberto }"
              ></i>
            </button>

            <Transition name="dropdown">
              <div
                v-if="dropdownAberto"
                role="listbox"
                aria-label="Opções de status"
                class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#101D32] p-1.5 shadow-2xl shadow-black/40"
                @keydown.esc.stop.prevent="fecharDropdown"
                @keydown.down.prevent="moverFocoOpcao(1)"
                @keydown.up.prevent="moverFocoOpcao(-1)"
                @keydown.home.prevent="focarOpcao(0)"
                @keydown.end.prevent="focarOpcao(opcoesStatus.length - 1)"
              >
                <button
                  v-for="opcao in opcoesStatus"
                  :key="opcao.valor"
                  :ref="el => registrarOpcao(el, opcao.valor)"
                  type="button"
                  role="option"
                  :aria-selected="filtroStatus === opcao.valor"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                  :class="filtroStatus === opcao.valor
                    ? 'bg-cyan-500/15 font-semibold text-cyan-300'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                  @click="selecionarStatus(opcao.valor)"
                >
                  <span class="flex items-center gap-3">
                    <i
                      :class="opcao.icone"
                      class="w-4 text-center"
                    ></i>
                    {{ opcao.rotulo }}
                  </span>

                  <i
                    v-if="filtroStatus === opcao.valor"
                    class="fa-solid fa-check text-cyan-400"
                  ></i>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ERRO GERAL -->
      <div
        v-if="erro"
        role="alert"
        class="mx-5 mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
      >
        <i class="fa-solid fa-circle-exclamation mr-2"></i>
        {{ erro }}
      </div>

      <!-- CARREGAMENTO -->
      <div
        v-if="carregando"
        class="flex min-h-52 flex-col items-center justify-center gap-3"
      >
        <i class="fa-solid fa-spinner fa-spin text-3xl text-[#22D3EE]"></i>

        <p class="text-sm text-slate-400">
          Carregando usuários...
        </p>
      </div>

      <!-- TABELA -->
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1050px] text-left text-sm">
            <thead class="bg-[#0B1220]/60 text-xs uppercase text-slate-400">
              <tr>
                <th class="px-5 py-4 font-semibold">Usuário</th>
                <th class="px-5 py-4 font-semibold">Matrícula / Turma</th>
                <th class="px-5 py-4 font-semibold">Perfil</th>
                <th class="px-5 py-4 font-semibold">Status</th>
                <th class="px-5 py-4 font-semibold">Cadastro</th>
                <th class="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-white/10">
              <tr
                v-for="item in usuariosFiltrados"
                :key="item.id"
                class="transition-colors hover:bg-white/[0.03]"
              >
                <!-- USUÁRIO: ABRE DETALHES -->
                <td class="px-5 py-4">
                  <button type="button"
                    class="group flex w-full items-center gap-3 rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    :aria-label="`Ver detalhes da conta de ${item.nome}`"
                    @click="abrirDetalhes(item)">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-500/30 bg-[#164E63] font-bold text-[#67E8F9]">
                      <img v-if="avatares[String(item.id)]" :src="avatares[String(item.id)]" :alt="`Foto de ${item.nome}`" class="h-full w-full object-cover" />
                      <span v-else>{{ inicial(item.nome) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white transition group-hover:text-cyan-300">{{ item.nome }} <i class="fa-solid fa-arrow-up-right-from-square ml-1 text-[10px] text-cyan-400 opacity-0 transition group-hover:opacity-100"></i></p>
                      <p class="mt-1 break-all text-xs text-slate-400">{{ item.email }}</p>
                    </div>
                  </button>
                </td>

                <!-- MATRÍCULA E TURMA -->
                <td class="px-5 py-4 text-slate-300">
                  <p>{{ item.matricula || 'Não informada' }}</p>

                  <p class="mt-1 text-xs text-slate-400">
                    {{ item.turma || 'Turma não informada' }}
                  </p>
                </td>

                <!-- PERFIL -->
                <td class="px-5 py-4">
                  <span
                    class="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"
                  >
                    {{ textoPerfil(item.perfil) }}
                  </span>
                </td>

                <!-- STATUS -->
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                    :class="classeStatus(item.status)"
                  >
                    <i :class="iconeStatus(item.status)"></i>
                    {{ textoStatus(item.status) }}
                  </span>
                </td>

                <!-- DATA -->
                <td class="px-5 py-4 text-slate-300">
                  {{ formatarData(item.criadoEm) }}
                </td>

                <!-- AÇÕES -->
                <td class="px-5 py-4">
                  <div
                    v-if="String(item.id) !== String(auth.usuario?.id)"
                    class="flex flex-wrap justify-end gap-2"
                  >
                    <button
                      v-if="item.status !== 'APROVADO'"
                      type="button"
                      :disabled="alterando || carregando || redefinindoSenha || promovendo"
                      class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      @click="abrirConfirmacao(item, 'APROVADO')"
                    >
                      <i class="fa-solid fa-check mr-1"></i>
                      {{ item.status === 'BLOQUEADO' ? 'Reativar' : 'Aprovar' }}
                    </button>

                    <button
                      v-if="item.status !== 'BLOQUEADO'"
                      type="button"
                      :disabled="alterando || carregando || redefinindoSenha || promovendo"
                      class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      @click="abrirConfirmacao(item, 'BLOQUEADO')"
                    >
                      <i class="fa-solid fa-ban mr-1"></i>
                      Bloquear
                    </button>

                  </div>

                  <span
                    v-else
                    class="block text-right text-xs text-slate-500"
                  >
                    Sua conta
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SEM RESULTADOS -->
        <div
          v-if="!erro && usuariosFiltrados.length === 0"
          class="flex flex-col items-center gap-3 px-5 py-12 text-center"
        >
          <i class="fa-solid fa-users-slash text-3xl text-slate-500"></i>

          <p class="font-semibold">
            Nenhum usuário encontrado
          </p>

          <p class="text-sm text-slate-400">
            Tente ajustar os filtros ou a pesquisa.
          </p>
        </div>

        <!-- RODAPÉ -->
        <div
          class="flex flex-wrap justify-between gap-2 border-t border-white/10 px-5 py-4 text-xs text-slate-400"
        >
          <span>
            Exibindo {{ usuariosFiltrados.length }} usuário(s)
          </span>

          <span>
            Total cadastrado: {{ usuarios.length }}
          </span>
        </div>
      </template>
    </section>

    <!-- PAINEL DE DETALHES DA CONTA -->
    <div v-if="usuarioDetalhes" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="presentation" @click.self="fecharDetalhes">
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes" class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#18263E] text-white shadow-2xl shadow-black/50">
        <div class="relative shrink-0 border-b border-white/10 bg-gradient-to-br from-[#101D32] to-[#164E63]/50 px-6 pb-6 pt-7 sm:px-8">
          <button type="button" aria-label="Fechar detalhes" class="absolute right-5 top-5 rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" @click="fecharDetalhes"><i class="fa-solid fa-xmark"></i></button>
          <p class="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><i class="fa-solid fa-id-card mr-2"></i>Detalhes da conta</p>
          <div class="flex items-center gap-4 pr-8">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400/50 bg-[#164E63] text-2xl font-bold text-cyan-200">
              <img v-if="avatares[String(usuarioDetalhes.id)]" :src="avatares[String(usuarioDetalhes.id)]" :alt="`Foto de ${usuarioDetalhes.nome}`" class="h-full w-full object-cover" />
              <span v-else>{{ inicial(usuarioDetalhes.nome) }}</span>
            </div>
            <div class="min-w-0">
              <h2 id="titulo-detalhes" class="break-words text-xl font-bold sm:text-2xl">{{ usuarioDetalhes.nome }}</h2>
              <p class="mt-1 break-all text-sm text-slate-300">{{ usuarioDetalhes.email }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">{{ textoPerfil(usuarioDetalhes.perfil) }}</span>
                <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold" :class="classeStatus(usuarioDetalhes.status)"><i :class="iconeStatus(usuarioDetalhes.status)"></i>{{ textoStatus(usuarioDetalhes.status) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="detalhes-rolagem min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-6 sm:p-8" tabindex="0" aria-label="Informações e ações da conta">
          <div>
            <h3 class="mb-3 text-sm font-bold text-white">Informações do usuário</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-white/10 bg-[#0B1220]/60 p-4"><p class="text-xs text-slate-400">Matrícula</p><p class="mt-1 break-words font-medium">{{ usuarioDetalhes.matricula || 'Não informada' }}</p></div>
              <div class="rounded-xl border border-white/10 bg-[#0B1220]/60 p-4"><p class="text-xs text-slate-400">Turma</p><p class="mt-1 break-words font-medium">{{ usuarioDetalhes.turma || 'Não informada' }}</p></div>
              <div class="rounded-xl border border-white/10 bg-[#0B1220]/60 p-4"><p class="text-xs text-slate-400">Cadastro</p><p class="mt-1 font-medium">{{ formatarData(usuarioDetalhes.criadoEm) }}</p></div>
              <div class="rounded-xl border border-white/10 bg-[#0B1220]/60 p-4"><p class="text-xs text-slate-400">Identificador</p><p class="mt-1 font-medium">#{{ usuarioDetalhes.id }}</p></div>
            </div>
          </div>
          <div v-if="String(usuarioDetalhes.id) !== String(auth.usuario?.id)">
            <h3 class="mb-3 text-sm font-bold text-white">Gerenciamento da conta</h3>
            <div class="space-y-3">
              <button v-if="usuarioDetalhes.perfil !== 'ADMIN'" type="button" :disabled="operacaoEmAndamento" class="flex w-full items-center gap-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/10 disabled:opacity-50" @click="iniciarRedefinicaoPelosDetalhes">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300"><i class="fa-solid fa-key"></i></span>
                <span class="flex-1"><span class="block font-semibold">Redefinir senha</span><span class="mt-1 block text-xs leading-5 text-slate-400">Criar uma nova senha e invalidar as sessões anteriores.</span></span>
                <i class="fa-solid fa-chevron-right text-slate-400"></i>
              </button>
              <button v-if="usuarioDetalhes.perfil === 'USER' && usuarioDetalhes.status === 'APROVADO'" type="button" :disabled="operacaoEmAndamento" class="flex w-full items-center gap-4 rounded-xl border border-violet-500/25 bg-violet-500/5 p-4 text-left transition hover:border-violet-400/50 hover:bg-violet-500/10 disabled:opacity-50" @click="iniciarPromocaoPelosDetalhes">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><i class="fa-solid fa-user-shield"></i></span>
                <span class="flex-1"><span class="block font-semibold">Promover a ADMIN</span><span class="mt-1 block text-xs leading-5 text-slate-400">Conceder privilégios administrativos mediante confirmação.</span></span>
                <i class="fa-solid fa-chevron-right text-slate-400"></i>
              </button>
              <p v-if="usuarioDetalhes.perfil === 'ADMIN'" class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Esta conta já é administradora. A redefinição de senha de outros administradores está bloqueada por segurança.</p>
              <p v-else-if="usuarioDetalhes.status !== 'APROVADO'" class="text-xs text-amber-300">A promoção só está disponível para usuários aprovados.</p>
            </div>
          </div>
          <p v-else class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Esta é sua conta. As ações administrativas sobre a própria conta não estão disponíveis.</p>
        </div>
        <div class="flex shrink-0 justify-end border-t border-white/10 bg-[#142238] px-6 py-3 sm:px-8"><button type="button" class="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10" @click="fecharDetalhes">Fechar</button></div>
      </section>
    </div>

    <!-- MODAL DE APROVAÇÃO / BLOQUEIO -->
    <div
      v-if="confirmacao"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="fecharConfirmacao"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacao"
        class="w-full max-w-md rounded-2xl border border-white/10 bg-[#18263E] p-6 shadow-2xl"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          :class="confirmacao.status === 'BLOQUEADO'
            ? 'bg-red-500/10 text-red-300'
            : 'bg-emerald-500/10 text-emerald-300'"
        >
          <i
            :class="confirmacao.status === 'BLOQUEADO'
              ? 'fa-solid fa-ban'
              : 'fa-solid fa-user-check'"
            class="text-xl"
          ></i>
        </div>

        <h2 id="titulo-confirmacao" class="text-xl font-bold">
          {{ tituloConfirmacao }}
        </h2>

        <p class="mt-3 text-sm leading-6 text-slate-400">
          Deseja realmente alterar o status de
          <strong class="text-white">
            {{ confirmacao.usuario.nome }}
          </strong>
          para
          <strong class="text-white">
            {{ textoStatus(confirmacao.status) }}
          </strong>?
        </p>

        <p
          v-if="confirmacao.status === 'BLOQUEADO'"
          class="mt-3 text-xs text-amber-300"
        >
          O bloqueio impedirá novos logins.
          O backend também verifica o status nas requisições autenticadas.
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            :disabled="alterando"
            class="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
            @click="fecharConfirmacao"
          >
            Cancelar
          </button>

          <button
            type="button"
            :disabled="alterando"
            class="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
            :class="confirmacao.status === 'BLOQUEADO'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-700'"
            @click="confirmarAlteracao"
          >
            <i
              v-if="alterando"
              class="fa-solid fa-spinner fa-spin mr-2"
            ></i>
            Confirmar
          </button>
        </div>
      </section>
    </div>

    <!-- MODAL DE PROMOÇÃO PARA ADMINISTRADOR -->
    <div
      v-if="usuarioPromocao"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="fecharPromocao"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-promocao"
        aria-describedby="descricao-promocao"
        class="w-full max-w-md rounded-2xl border border-white/10 bg-[#18263E] p-6 text-white shadow-2xl"
      >
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
          <i class="fa-solid fa-user-shield text-xl"></i>
        </div>

        <h2 id="titulo-promocao" class="text-xl font-bold">
          Promover a administrador
        </h2>

        <p id="descricao-promocao" class="mt-3 text-sm leading-6 text-slate-300">
          Deseja conceder permissões administrativas a
          <strong class="text-white">{{ usuarioPromocao.nome }}</strong>?
        </p>
        <p class="mt-1 break-all text-xs text-slate-400">
          {{ usuarioPromocao.email }}
        </p>

        <div class="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          <i class="fa-solid fa-triangle-exclamation mr-1"></i>
          Esta ação concede acesso à administração de usuários. As sessões
          anteriores dessa conta serão invalidadas, exigindo novo login.
        </div>

        <p v-if="erroPromocao" role="alert" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {{ erroPromocao }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            :disabled="promovendo"
            class="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
            @click="fecharPromocao"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="promovendo"
            class="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="confirmarPromocao"
          >
            <i v-if="promovendo" class="fa-solid fa-spinner fa-spin mr-2"></i>
            Confirmar promoção
          </button>
        </div>
      </section>
    </div>

    <!-- MODAL DE REDEFINIÇÃO DE SENHA -->
    <div
      v-if="usuarioRedefinicao"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="fecharRedefinicaoSenha"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-redefinicao"
        class="w-full max-w-md rounded-2xl border border-white/10 bg-[#18263E] p-6 shadow-2xl"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"
        >
          <i class="fa-solid fa-key text-xl"></i>
        </div>

        <h2 id="titulo-redefinicao" class="text-xl font-bold">
          Redefinir senha
        </h2>

        <p class="mt-3 text-sm leading-6 text-slate-400">
          Defina uma nova senha para
          <strong class="text-white">
            {{ usuarioRedefinicao.nome }}
          </strong>.
        </p>

        <p class="mt-1 break-all text-xs text-slate-500">
          {{ usuarioRedefinicao.email }}
        </p>

        <form
          class="mt-6 space-y-4"
          @submit.prevent="confirmarRedefinicaoSenha"
        >
          <!-- NOVA SENHA -->
          <div>
            <label
              for="nova-senha-admin"
              class="mb-2 block text-sm font-semibold"
            >
              Nova senha
            </label>

            <div class="relative">
              <input
                id="nova-senha-admin"
                v-model="novaSenha"
                :type="mostrarNovaSenha ? 'text' : 'password'"
                autocomplete="new-password"
                minlength="8"
                maxlength="72"
                required
                :disabled="redefinindoSenha"
                placeholder="Digite a nova senha"
                class="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-50"
              />

              <button
                type="button"
                :disabled="redefinindoSenha"
                :aria-label="mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
                @click="mostrarNovaSenha = !mostrarNovaSenha"
              >
                <i
                  :class="mostrarNovaSenha
                    ? 'fa-solid fa-eye-slash'
                    : 'fa-solid fa-eye'"
                ></i>
              </button>
            </div>
          </div>

          <!-- CONFIRMAÇÃO -->
          <div>
            <label
              for="confirmar-senha-admin"
              class="mb-2 block text-sm font-semibold"
            >
              Confirmar nova senha
            </label>

            <input
              id="confirmar-senha-admin"
              v-model="confirmacaoNovaSenha"
              :type="mostrarNovaSenha ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="8"
              maxlength="72"
              required
              :disabled="redefinindoSenha"
              placeholder="Repita a nova senha"
              class="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-50"
            />
          </div>

          <p class="text-xs leading-5 text-slate-400">
            A senha deve ter de 8 a 72 caracteres,
            incluindo pelo menos uma letra e um número.
          </p>

          <div
            class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200"
          >
            <i class="fa-solid fa-shield-halved mr-1"></i>
            Após a redefinição, os tokens anteriores desse usuário
            deixarão de ser aceitos pelo backend.
          </div>

          <p
            v-if="erroRedefinicao"
            role="alert"
            class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ erroRedefinicao }}
          </p>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              :disabled="redefinindoSenha"
              class="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
              @click="fecharRedefinicaoSenha"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="redefinindoSenha"
              class="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:opacity-50"
            >
              <i
                v-if="redefinindoSenha"
                class="fa-solid fa-spinner fa-spin mr-2"
              ></i>
              Confirmar senha
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- MENSAGEM DE SUCESSO -->
    <div
      v-if="sucesso"
      role="status"
      class="fixed bottom-5 right-5 z-[110] max-w-sm rounded-xl border border-emerald-500/30 bg-[#12352F] p-4 text-sm font-semibold text-emerald-200 shadow-xl"
    >
      <i class="fa-solid fa-circle-check mr-2"></i>
      {{ sucesso }}
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const auth = useAuthStore()

// ======================================================
// ESTADOS GERAIS
// ======================================================

const usuarios = ref([])
const pesquisa = ref('')
const filtroStatus = ref('TODOS')

const carregando = ref(false)
const alterando = ref(false)

const erro = ref('')
const sucesso = ref('')
const confirmacao = ref(null)
const usuarioDetalhes = ref(null)
const operacaoEmAndamento = computed(() => carregando.value || alterando.value || redefinindoSenha.value || promovendo.value)

// Promoção de usuário aprovado para administrador.
const usuarioPromocao = ref(null)
const promovendo = ref(false)
const erroPromocao = ref('')

// ======================================================
// ESTADOS DA REDEFINIÇÃO DE SENHA
// ======================================================

const usuarioRedefinicao = ref(null)
const novaSenha = ref('')
const confirmacaoNovaSenha = ref('')
const mostrarNovaSenha = ref(false)
const redefinindoSenha = ref(false)
const erroRedefinicao = ref('')

// ======================================================
// DROPDOWN PERSONALIZADO
// ======================================================

const dropdownAberto = ref(false)
const dropdownStatusRef = ref(null)
const opcoesRefs = new Map()

const opcoesStatus = [
  {
    valor: 'TODOS',
    rotulo: 'Todos os status',
    icone: 'fa-solid fa-layer-group'
  },
  {
    valor: 'PENDENTE',
    rotulo: 'Pendentes',
    icone: 'fa-solid fa-clock'
  },
  {
    valor: 'APROVADO',
    rotulo: 'Aprovados',
    icone: 'fa-solid fa-circle-check'
  },
  {
    valor: 'BLOQUEADO',
    rotulo: 'Bloqueados',
    icone: 'fa-solid fa-ban'
  }
]

const rotuloFiltroStatus = computed(() => {
  const opcao = opcoesStatus.find(
    item => item.valor === filtroStatus.value
  )

  return opcao?.rotulo || 'Todos os status'
})

function registrarOpcao(elemento, valor) {
  if (elemento) {
    opcoesRefs.set(valor, elemento)
  } else {
    opcoesRefs.delete(valor)
  }
}

async function focarOpcao(indice) {
  await nextTick()

  const indiceValido = Math.max(
    0,
    Math.min(indice, opcoesStatus.length - 1)
  )

  const valor = opcoesStatus[indiceValido]?.valor

  opcoesRefs.get(valor)?.focus()
}

function moverFocoOpcao(direcao) {
  const elementoAtivo = document.activeElement

  const indiceAtual = opcoesStatus.findIndex(
    opcao => opcoesRefs.get(opcao.valor) === elementoAtivo
  )

  const proximoIndice = indiceAtual < 0
    ? 0
    : (indiceAtual + direcao + opcoesStatus.length) %
      opcoesStatus.length

  focarOpcao(proximoIndice)
}

function alternarDropdown() {
  dropdownAberto.value = !dropdownAberto.value
}

async function abrirDropdownPeloTeclado() {
  if (!dropdownAberto.value) {
    dropdownAberto.value = true
  }

  const indice = opcoesStatus.findIndex(
    opcao => opcao.valor === filtroStatus.value
  )

  await focarOpcao(indice >= 0 ? indice : 0)
}

function selecionarStatus(status) {
  filtroStatus.value = status
  dropdownAberto.value = false
}

function fecharDropdown() {
  dropdownAberto.value = false
  dropdownStatusRef.value?.querySelector('button')?.focus()
}

function fecharDropdownFora(evento) {
  if (
    dropdownStatusRef.value &&
    !dropdownStatusRef.value.contains(evento.target)
  ) {
    dropdownAberto.value = false
  }
}

function fecharDropdownEscape(evento) {
  if (evento.key !== 'Escape') return

  if (usuarioRedefinicao.value) {
    fecharRedefinicaoSenha()
    return
  }

  if (usuarioPromocao.value) {
    fecharPromocao()
    return
  }

  if (confirmacao.value) {
    fecharConfirmacao()
    return
  }

  if (usuarioDetalhes.value) {
    fecharDetalhes()
    return
  }

  if (dropdownAberto.value) {
    fecharDropdown()
  }
}

// ======================================================
// DETALHES DO USUÁRIO
// ======================================================

function abrirDetalhes(usuario) {
  if (operacaoEmAndamento.value) return
  usuarioDetalhes.value = usuario
}

function fecharDetalhes() {
  if (operacaoEmAndamento.value) return
  usuarioDetalhes.value = null
}

function iniciarRedefinicaoPelosDetalhes() {
  const usuario = usuarioDetalhes.value
  if (!usuario || operacaoEmAndamento.value) return
  abrirRedefinicaoSenha(usuario)
  if (usuarioRedefinicao.value) usuarioDetalhes.value = null
}

function iniciarPromocaoPelosDetalhes() {
  const usuario = usuarioDetalhes.value
  if (!usuario || operacaoEmAndamento.value) return
  abrirPromocao(usuario)
  if (usuarioPromocao.value) usuarioDetalhes.value = null
}

// ======================================================
// AVATARES LOCAIS
// ======================================================

const avatares = ref({})

function carregarAvatares() {
  const fotos = {}

  for (const usuario of usuarios.value) {
    try {
      const foto = localStorage.getItem(
        `cti-avatar-${usuario.id}`
      )

      if (foto) {
        fotos[String(usuario.id)] = foto
      }
    } catch {
      // Sem armazenamento: usa a inicial do nome.
    }
  }

  avatares.value = fotos
}

function aoAtualizarAvatar(evento) {
  if (evento.detail?.usuarioId != null) {
    carregarAvatares()
  }
}

// ======================================================
// COMUNICAÇÃO COM O BACKEND
// ======================================================

async function requisitar(caminho, opcoes = {}) {
  try {
    const resposta = await api({
      url: caminho,
      ...opcoes
    })

    return resposta.data
  } catch (e) {
    const dadosErro = e.response?.data

    const mensagem =
      dadosErro?.erro ||
      dadosErro?.mensagem ||
      dadosErro?.message ||
      (typeof dadosErro === 'string' ? dadosErro : null) ||
      e.message ||
      'Não foi possível comunicar com o servidor.'

    throw new Error(mensagem)
  }
}

async function carregarUsuarios() {
  if (
    carregando.value ||
    alterando.value ||
    redefinindoSenha.value ||
    promovendo.value
  ) {
    return
  }

  carregando.value = true
  erro.value = ''
  sucesso.value = ''

  try {
    const dados = await requisitar('/admin/usuarios')

    if (!Array.isArray(dados)) {
      throw new Error('A API retornou uma lista inválida.')
    }

    usuarios.value = dados
    carregarAvatares()
  } catch (e) {
    erro.value =
      e.message || 'Não foi possível carregar os usuários.'

    usuarios.value = []
    avatares.value = {}
  } finally {
    carregando.value = false
  }
}

// ======================================================
// PESQUISA E FILTROS
// ======================================================

const usuariosFiltrados = computed(() => {
  const termo = pesquisa.value
    .trim()
    .toLocaleLowerCase('pt-BR')

  return usuarios.value.filter(item => {
    const correspondeStatus =
      filtroStatus.value === 'TODOS' ||
      item.status === filtroStatus.value

    const correspondePesquisa =
      !termo ||
      (item.nome || '')
        .toLocaleLowerCase('pt-BR')
        .includes(termo) ||
      (item.email || '')
        .toLocaleLowerCase('pt-BR')
        .includes(termo)

    return correspondeStatus && correspondePesquisa
  })
})

// ======================================================
// INDICADORES
// ======================================================

const indicadores = computed(() => [
  {
    titulo: 'Total de usuários',
    valor: usuarios.value.length,
    descricao: 'Contas cadastradas no sistema',
    icone: 'fa-solid fa-users',
    cor: 'text-cyan-400',
    fundo: 'bg-cyan-500/10'
  },
  {
    titulo: 'Aprovados',
    valor: usuarios.value.filter(
      u => u.status === 'APROVADO'
    ).length,
    descricao: 'Usuários com acesso liberado',
    icone: 'fa-solid fa-circle-check',
    cor: 'text-emerald-400',
    fundo: 'bg-emerald-500/10'
  },
  {
    titulo: 'Pendentes',
    valor: usuarios.value.filter(
      u => u.status === 'PENDENTE'
    ).length,
    descricao: 'Aguardando aprovação',
    icone: 'fa-solid fa-clock',
    cor: 'text-amber-400',
    fundo: 'bg-amber-500/10'
  },
  {
    titulo: 'Bloqueados',
    valor: usuarios.value.filter(
      u => u.status === 'BLOQUEADO'
    ).length,
    descricao: 'Contas com acesso bloqueado',
    icone: 'fa-solid fa-ban',
    cor: 'text-rose-400',
    fundo: 'bg-rose-500/10'
  }
])

// ======================================================
// FORMATAÇÃO
// ======================================================

function inicial(nome) {
  return (nome || 'U').charAt(0).toUpperCase()
}

function textoPerfil(perfil) {
  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'USER') return 'Usuário'
  return 'Não informado'
}

function textoStatus(status) {
  if (status === 'APROVADO') return 'Aprovado'
  if (status === 'PENDENTE') return 'Pendente'
  if (status === 'BLOQUEADO') return 'Bloqueado'
  return 'Desconhecido'
}

function classeStatus(status) {
  if (status === 'APROVADO') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  }

  if (status === 'PENDENTE') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  }

  if (status === 'BLOQUEADO') {
    return 'border-red-500/30 bg-red-500/10 text-red-300'
  }

  return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
}

function iconeStatus(status) {
  if (status === 'APROVADO') {
    return 'fa-solid fa-circle-check'
  }

  if (status === 'PENDENTE') {
    return 'fa-solid fa-clock'
  }

  if (status === 'BLOQUEADO') {
    return 'fa-solid fa-circle-xmark'
  }

  return 'fa-solid fa-circle-question'
}

function formatarData(data) {
  if (!data) return 'Não informada'

  const convertida = new Date(data)

  if (Number.isNaN(convertida.getTime())) {
    return 'Data inválida'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(convertida)
}

// ======================================================
// MODAL DE CONFIRMAÇÃO DE STATUS
// ======================================================

function abrirConfirmacao(usuario, status) {
  if (
    alterando.value ||
    carregando.value ||
    redefinindoSenha.value ||
    promovendo.value
  ) {
    return
  }

  if (String(usuario.id) === String(auth.usuario?.id)) {
    return
  }

  confirmacao.value = { usuario, status }
  erro.value = ''
  sucesso.value = ''
}

function fecharConfirmacao() {
  if (!alterando.value) {
    confirmacao.value = null
  }
}

const tituloConfirmacao = computed(() => {
  if (!confirmacao.value) return ''

  if (confirmacao.value.status === 'BLOQUEADO') {
    return 'Bloquear usuário'
  }

  if (confirmacao.value.usuario.status === 'BLOQUEADO') {
    return 'Reativar usuário'
  }

  return 'Aprovar usuário'
})

// ======================================================
// ALTERAÇÃO DE STATUS
// ======================================================

async function confirmarAlteracao() {
  if (!confirmacao.value || alterando.value) return

  const { usuario, status } = confirmacao.value

  if (String(usuario.id) === String(auth.usuario?.id)) {
    return
  }

  alterando.value = true
  erro.value = ''
  sucesso.value = ''

  let alteracaoConcluida = false

  try {
    await requisitar(
      `/admin/usuarios/${usuario.id}/status`,
      {
        method: 'PATCH',
        data: { status }
      }
    )

    alteracaoConcluida = true
    confirmacao.value = null

    const dados = await requisitar('/admin/usuarios')

    if (!Array.isArray(dados)) {
      throw new Error('A API retornou uma lista inválida.')
    }

    usuarios.value = dados
    carregarAvatares()

    sucesso.value =
      `Status de ${usuario.nome} atualizado com sucesso.`
  } catch (e) {
    if (alteracaoConcluida) {
      erro.value =
        'O status foi alterado, mas não foi possível atualizar ' +
        'a lista. Clique em Atualizar para consultar novamente.'
    } else {
      erro.value =
        e.message || 'Não foi possível alterar o status.'
    }

    confirmacao.value = null
  } finally {
    alterando.value = false
  }
}

// ======================================================
// PROMOÇÃO PARA ADMINISTRADOR
// ======================================================

function abrirPromocao(usuario) {
  if (
    carregando.value ||
    alterando.value ||
    redefinindoSenha.value ||
    promovendo.value ||
    usuario.perfil !== 'USER' ||
    usuario.status !== 'APROVADO' ||
    String(usuario.id) === String(auth.usuario?.id)
  ) return

  usuarioPromocao.value = usuario
  erroPromocao.value = ''
  erro.value = ''
  sucesso.value = ''
}

function fecharPromocao() {
  if (promovendo.value) return
  usuarioPromocao.value = null
  erroPromocao.value = ''
}

async function confirmarPromocao() {
  if (!usuarioPromocao.value || promovendo.value) return

  const usuario = usuarioPromocao.value
  if (
    usuario.perfil !== 'USER' ||
    usuario.status !== 'APROVADO' ||
    String(usuario.id) === String(auth.usuario?.id)
  ) return

  promovendo.value = true
  erroPromocao.value = ''
  erro.value = ''
  sucesso.value = ''

  let promocaoConcluida = false

  try {
    // A instância api existente gerencia cookies e cabeçalho CSRF.
    await requisitar(`/admin/usuarios/${usuario.id}/promover`, {
      method: 'PATCH'
    })
    promocaoConcluida = true
    usuarioPromocao.value = null

    const dados = await requisitar('/admin/usuarios')
    if (!Array.isArray(dados)) {
      throw new Error('A API retornou uma lista inválida.')
    }

    usuarios.value = dados
    carregarAvatares()
    sucesso.value = `${usuario.nome} foi promovido a administrador com sucesso.`
  } catch (e) {
    if (promocaoConcluida) {
      erro.value = 'A promoção foi concluída, mas não foi possível atualizar a lista. Clique em Atualizar.'
    } else {
      erroPromocao.value = e.message || 'Não foi possível promover o usuário.'
    }
  } finally {
    promovendo.value = false
  }
}

// ======================================================
// REDEFINIÇÃO DE SENHA
// ======================================================

function abrirRedefinicaoSenha(usuario) {
  if (
    alterando.value ||
    carregando.value ||
    redefinindoSenha.value ||
    promovendo.value
  ) {
    return
  }

  if (
    usuario.perfil === 'ADMIN' ||
    String(usuario.id) === String(auth.usuario?.id)
  ) {
    return
  }

  usuarioRedefinicao.value = usuario
  novaSenha.value = ''
  confirmacaoNovaSenha.value = ''
  mostrarNovaSenha.value = false
  erroRedefinicao.value = ''
  erro.value = ''
  sucesso.value = ''
}

function limparCamposSenha() {
  novaSenha.value = ''
  confirmacaoNovaSenha.value = ''
  mostrarNovaSenha.value = false
  erroRedefinicao.value = ''
}

function fecharRedefinicaoSenha() {
  if (redefinindoSenha.value) return

  usuarioRedefinicao.value = null
  limparCamposSenha()
}

async function confirmarRedefinicaoSenha() {
  if (
    !usuarioRedefinicao.value ||
    redefinindoSenha.value ||
    promovendo.value
  ) {
    return
  }

  const usuario = usuarioRedefinicao.value
  const senha = novaSenha.value

  erroRedefinicao.value = ''

  // Não permite redefinir senha de ADMIN.
  if (
    usuario.perfil === 'ADMIN' ||
    String(usuario.id) === String(auth.usuario?.id)
  ) {
    erroRedefinicao.value =
      'Não é permitido redefinir a senha deste administrador.'
    return
  }

  // Valida os requisitos básicos.
  if (
    senha.length < 8 ||
    senha.length > 72 ||
    !/[A-Za-z]/.test(senha) ||
    !/\d/.test(senha)
  ) {
    erroRedefinicao.value =
      'A senha deve ter de 8 a 72 caracteres, com letras e números.'
    return
  }

  // BCrypt possui limite de 72 bytes.
  if (new TextEncoder().encode(senha).length > 72) {
    erroRedefinicao.value =
      'A senha não pode ultrapassar 72 bytes.'
    return
  }

  // Confirmação obrigatória.
  if (senha !== confirmacaoNovaSenha.value) {
    erroRedefinicao.value =
      'As senhas informadas não coincidem.'
    return
  }

  redefinindoSenha.value = true

  try {
    await requisitar(
      `/admin/usuarios/${usuario.id}/senha`,
      {
        method: 'PATCH',
        data: {
          novaSenha: senha
        }
      }
    )

    // Limpa os campos sensíveis após o sucesso.
    usuarioRedefinicao.value = null
    limparCamposSenha()

    sucesso.value =
      `Senha de ${usuario.nome} redefinida com sucesso.`
  } catch (e) {
    erroRedefinicao.value =
      e.message || 'Não foi possível redefinir a senha.'
  } finally {
    redefinindoSenha.value = false
  }
}

// ======================================================
// EVENTOS DO COMPONENTE
// ======================================================

onMounted(() => {
  window.addEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )

  document.addEventListener(
    'pointerdown',
    fecharDropdownFora
  )

  document.addEventListener(
    'keydown',
    fecharDropdownEscape
  )

  carregarUsuarios()
})

onUnmounted(() => {
  window.removeEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )

  document.removeEventListener(
    'pointerdown',
    fecharDropdownFora
  )

  document.removeEventListener(
    'keydown',
    fecharDropdownEscape
  )

  opcoesRefs.clear()
  limparCamposSenha()
  usuarioPromocao.value = null
})
</script>

<style scoped>
/* ======================================================
   CARDS ANIMADOS
   ====================================================== */

.card-indicador {
  animation: entrada-card 450ms ease-out both;

  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.card-indicador:hover {
  transform: translateY(-5px);
  border-color: rgba(34, 211, 238, 0.35);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.icone-indicador {
  transition: transform 220ms ease;
}

.card-indicador:hover .icone-indicador {
  transform: scale(1.1);
}

@keyframes entrada-card {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ======================================================
   DROPDOWN PERSONALIZADO
   ====================================================== */

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}

/* ======================================================
   ACESSIBILIDADE
   ====================================================== */

@media (prefers-reduced-motion: reduce) {
  .card-indicador {
    animation: none;
    transition: none;
  }

  .card-indicador:hover {
    transform: none;
  }

  .icone-indicador {
    transition: none;
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}
/* Mantém rolagem por mouse, toque e teclado sem a barra lateral visível. */
.detalhes-rolagem {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.detalhes-rolagem::-webkit-scrollbar {
  display: none;
}
</style>