<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DeviceDashboardPreview from '../components/DeviceDashboardPreview.vue'

const menuAberto = ref(false)
const anoAtual = new Date().getFullYear()

const funcionalidades = [
  { icone: 'fa-solid fa-cloud-arrow-up', titulo: 'Upload inteligente', descricao: 'Importe planilhas Excel e CSV para iniciar a análise dos seus dados.', cor: 'cyan' },
  { icone: 'fa-solid fa-file-circle-check', titulo: 'Relatórios detalhados', descricao: 'Acompanhe os registros validados, inválidos e as inconsistências encontradas.', cor: 'turquoise' },
  { icone: 'fa-solid fa-chart-simple', titulo: 'Gráficos interativos', descricao: 'Transforme resultados em indicadores visuais claros e fáceis de interpretar.', cor: 'cyan' },
]

const etapas = [
  { numero: '01', icone: 'fa-solid fa-file-arrow-up', titulo: 'Importe seus dados', descricao: 'Selecione uma planilha Excel ou CSV para começar.' },
  { numero: '02', icone: 'fa-solid fa-list-check', titulo: 'Valide as informações', descricao: 'Identifique registros válidos e possíveis inconsistências.' },
  { numero: '03', icone: 'fa-solid fa-chart-pie', titulo: 'Analise os resultados', descricao: 'Explore relatórios e gráficos para apoiar suas decisões.' },
]

const contatos = [
  { nome: 'WhatsApp', icone: 'fa-brands fa-whatsapp', href: '' },
  { nome: 'Instagram', icone: 'fa-brands fa-instagram', href: '' },
  { nome: 'E-mail', icone: 'fa-regular fa-envelope', href: '' },
]

function fecharMenu() { menuAberto.value = false }
function contatoIndisponivel(nome) { alert(`O contato de ${nome} será disponibilizado em breve.`) }

const total = 1250
const validos = 1180
const invalidos = total - validos
const taxa = computed(() => ((validos / total) * 100).toFixed(1).replace('.', ','))
</script>

<template>
  <div class="min-h-screen overflow-x-clip bg-[#020617] text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <RouterLink to="/" class="flex shrink-0 items-center gap-3" @click="fecharMenu">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-xl text-[#38BDF8]"><i class="fa-solid fa-cloud"></i></span>
          <span class="text-lg font-extrabold tracking-wider">CTI <span class="text-[#38BDF8]">INSIGHTS</span></span>
        </RouterLink>

        <nav class="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex" aria-label="Navegação principal">
          <a href="#inicio" class="transition hover:text-[#38BDF8]">Início</a>
          <a href="#funcionalidades" class="transition hover:text-[#38BDF8]">Funcionalidades</a>
          <a href="#como-funciona" class="transition hover:text-[#38BDF8]">Como funciona</a>
          <a href="#sobre" class="transition hover:text-[#38BDF8]">Sobre</a>
        </nav>

        <div class="hidden items-center gap-4 md:flex">
          <RouterLink to="/login" class="text-sm font-semibold text-slate-300 transition hover:text-white">Entrar</RouterLink>
          <RouterLink to="/cadastro" class="rounded-xl bg-[#38BDF8] px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-300">Criar conta <i class="fa-solid fa-arrow-right ml-1"></i></RouterLink>
        </div>

        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-lg text-white md:hidden" :aria-expanded="menuAberto" aria-label="Abrir menu" @click="menuAberto = !menuAberto">
          <i :class="menuAberto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
        </button>
      </div>
      <nav v-if="menuAberto" class="flex flex-col gap-1 border-t border-white/10 bg-[#101D32] px-5 py-4 md:hidden" aria-label="Navegação móvel">
        <a href="#inicio" class="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10" @click="fecharMenu">Início</a>
        <a href="#funcionalidades" class="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10" @click="fecharMenu">Funcionalidades</a>
        <a href="#como-funciona" class="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10" @click="fecharMenu">Como funciona</a>
        <a href="#sobre" class="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10" @click="fecharMenu">Sobre</a>
        <div class="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <RouterLink to="/login" class="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold" @click="fecharMenu">Entrar</RouterLink>
          <RouterLink to="/cadastro" class="rounded-xl bg-[#38BDF8] px-4 py-3 text-center text-sm font-bold text-slate-950" @click="fecharMenu">Criar conta</RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <!-- Hero -->
      <section id="inicio" class="relative isolate overflow-hidden scroll-mt-24">
        <div aria-hidden="true" class="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#38BDF8]/10 blur-[110px]"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -right-40 top-20 h-[480px] w-[480px] rounded-full bg-[#00C7A5]/10 blur-[110px]"></div>
        <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-12 xl:grid-cols-[0.88fr_1.12fr] xl:gap-8 xl:pt-12 lg:px-10">
          <div class="min-w-0">
            <span class="inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/25 bg-[#38BDF8]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#7DD3FC]"><i class="fa-solid fa-wand-magic-sparkles"></i> INTELIGÊNCIA PARA SEUS DADOS</span>
            <h1 class="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.55rem] xl:text-6xl">Transforme <span class="bg-gradient-to-r from-[#38BDF8] to-[#00C7A5] bg-clip-text text-transparent">dados</span> em decisões inteligentes.</h1>
            <p class="mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">Organize seus dados, identifique padrões e acompanhe indicadores em um só lugar. Importe planilhas, valide informações e visualize resultados com clareza.</p>
            <div class="mt-7 flex flex-wrap gap-4">
              <RouterLink to="/cadastro" class="inline-flex items-center justify-center gap-3 rounded-xl bg-[#38BDF8] px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:-translate-y-1 hover:bg-sky-300">Começar agora <i class="fa-solid fa-arrow-right"></i></RouterLink>
              <RouterLink to="/login" class="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-[#38BDF8]/40 hover:bg-white/10"><i class="fa-regular fa-user"></i> Já tenho uma conta</RouterLink>
            </div>
            <div class="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400"><span><i class="fa-solid fa-circle-check mr-2 text-[#00C7A5]"></i>Importação simplificada</span><span><i class="fa-solid fa-circle-check mr-2 text-[#00C7A5]"></i>Validação de dados</span></div>
          </div>

          <!-- Mockups feitos em Vue/Tailwind, sem imagens estáticas -->
          <div class="relative mx-auto w-full max-w-[720px]" aria-label="Demonstração do CTI Insights em quatro dispositivos">
            <div aria-hidden="true" class="pointer-events-none absolute inset-8 rounded-full bg-[#38BDF8]/15 blur-[75px]"></div>

            <!-- Desktop: maior tela, ao fundo -->
            <div class="relative ml-auto w-[88%] sm:w-[83%]">
              <div class="rounded-xl border-[5px] border-[#25334a] bg-[#060b17] p-1 shadow-2xl shadow-black/60 sm:rounded-2xl sm:border-[8px]">
                <div class="aspect-[16/10] overflow-hidden rounded-md">
                  <DeviceDashboardPreview device="desktop" />
                </div>
              </div>
              <div class="mx-auto h-5 w-3 bg-gradient-to-b from-[#526078] to-[#273449] sm:h-7 sm:w-4"></div>
              <div class="mx-auto h-2 w-24 rounded-t-md bg-[#3b4b63] sm:w-32"></div>
              <p class="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-medium text-slate-400"><i class="fa-solid fa-desktop text-[#38BDF8]" aria-hidden="true"></i> Desktop</p>
            </div>

            <!-- Notebook: sobreposto à esquerda -->
            <div class="relative -mt-[17%] w-[70%] sm:-mt-[22%] sm:w-[66%]">
              <div class="rounded-t-xl border-[5px] border-[#26364d] bg-[#070c17] p-1 shadow-2xl shadow-black/70">
                <div class="aspect-[16/10] overflow-hidden rounded-sm"><DeviceDashboardPreview device="laptop" /></div>
              </div>
              <div class="h-2 rounded-b-[45%] bg-gradient-to-b from-[#63718a] to-[#26364d] shadow-lg shadow-black/40"></div>
              <p class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400"><i class="fa-solid fa-laptop text-[#38BDF8]" aria-hidden="true"></i> Notebook</p>
            </div>

            <!-- Tablet e celular, posicionados à frente -->
            <div class="relative z-10 -mt-[11%] ml-auto flex w-[75%] items-end justify-end gap-3 pr-1 sm:-mt-[15%] sm:gap-5 sm:pr-6">
              <div class="relative w-[54%] max-w-[240px]">
                <div class="rounded-[14px] border-[6px] border-[#29384e] bg-[#060b17] p-1 shadow-2xl shadow-black/70 sm:rounded-[22px] sm:border-[9px]">
                <div class="aspect-[4/5] overflow-hidden rounded-md"><DeviceDashboardPreview device="tablet" /></div>
                <div class="mx-auto mt-1 h-1 w-1 rounded-full bg-slate-500"></div>
                </div>
                <p class="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400"><i class="fa-solid fa-tablet-screen-button text-[#38BDF8]" aria-hidden="true"></i> Tablet</p>
              </div>
              <div class="w-[33%] max-w-[125px]">
                <div class="rounded-[18px] border-[5px] border-[#29384e] bg-[#060b17] p-0.5 shadow-2xl shadow-black/70 sm:rounded-[25px] sm:border-[7px]">
                <div class="mx-auto mb-1 h-1 w-8 rounded-full bg-slate-600"></div>
                <div class="aspect-[9/17] overflow-hidden rounded-[9px]"><DeviceDashboardPreview device="mobile" /></div>
                </div>
                <p class="mt-2 flex items-center justify-center gap-1 text-[10px] font-medium text-slate-400 sm:text-[11px]"><i class="fa-solid fa-mobile-screen-button text-[#00C7A5]" aria-hidden="true"></i> Celular</p>
              </div>
            </div>
            <p class="mt-6 text-center text-xs leading-5 text-slate-400">
              <i class="fa-solid fa-circle-info mr-1"></i>
              Prévia interativa baseada nas telas de Upload, Relatórios e Gráficos. Dados fictícios para demonstração.
            </p>
          </div>
        </div>
      </section>

      <!-- Funcionalidades -->
      <section id="funcionalidades" class="scroll-mt-24 border-y border-white/5 bg-[#101D32]/40 py-20 sm:py-24">
        <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div class="mx-auto max-w-2xl text-center"><span class="text-xs font-bold uppercase tracking-[0.2em] text-[#38BDF8]">Funcionalidades</span><h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo o que você precisa para entender seus dados</h2><p class="mt-4 leading-7 text-slate-400">Da importação à visualização: um fluxo mais organizado para transformar informações em resultados.</p></div>
          <div class="mt-12 grid gap-6 md:grid-cols-3">
            <article v-for="item in funcionalidades" :key="item.titulo" class="group rounded-3xl border border-white/10 bg-[#101D32]/80 p-7 transition duration-300 hover:-translate-y-2 hover:border-[#38BDF8]/35 hover:bg-[#17263D] hover:shadow-xl hover:shadow-sky-500/5"><div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-2xl text-[#38BDF8] transition group-hover:scale-110"><i :class="item.icone"></i></div><h3 class="mt-6 text-xl font-bold">{{ item.titulo }}</h3><p class="mt-3 text-sm leading-7 text-slate-400">{{ item.descricao }}</p><div class="mt-6 text-xs font-bold text-[#38BDF8]">CTI INSIGHTS <i class="fa-solid fa-arrow-trend-up ml-2"></i></div></article>
          </div>
        </div>
      </section>

      <!-- Demonstração -->
      <section id="demonstracao" class="relative isolate overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" class="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#00C7A5]/10 blur-[100px]"></div>
        <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div><span class="text-xs font-bold uppercase tracking-[0.2em] text-[#00C7A5]">Visão inteligente</span><h2 class="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Uma visão completa dos seus dados.</h2><p class="mt-5 max-w-lg leading-8 text-slate-400">Identifique rapidamente quantos registros foram processados, quantos passaram pela validação e onde estão as inconsistências.</p><div class="mt-8 space-y-4"><div class="flex items-center gap-3 text-sm text-slate-300"><i class="fa-solid fa-check-circle text-[#00C7A5]"></i> Indicadores de qualidade dos dados</div><div class="flex items-center gap-3 text-sm text-slate-300"><i class="fa-solid fa-check-circle text-[#00C7A5]"></i> Relatórios organizados</div><div class="flex items-center gap-3 text-sm text-slate-300"><i class="fa-solid fa-check-circle text-[#00C7A5]"></i> Visualização clara dos resultados</div></div><a href="#como-funciona" class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#38BDF8] transition hover:gap-3">Entenda como funciona <i class="fa-solid fa-arrow-right"></i></a></div>
          <div class="rounded-3xl border border-white/10 bg-[#101D32]/80 p-6 shadow-2xl shadow-black/20 sm:p-8"><div class="flex flex-wrap items-center justify-between gap-3"><h3 class="font-bold">Qualidade dos dados</h3><span class="rounded-full border border-[#00C7A5]/20 bg-[#00C7A5]/10 px-3 py-1 text-xs font-semibold text-[#00C7A5]">Exemplo ilustrativo</span></div><div class="mt-8 flex items-end justify-between gap-4"><div><p class="text-sm text-slate-400">Taxa de validação</p><p class="mt-2 text-5xl font-extrabold text-white">{{ taxa }}<span class="text-2xl text-[#00C7A5]">%</span></p></div><i class="fa-solid fa-shield-halved text-4xl text-[#00C7A5]/70"></i></div><div class="mt-7 h-3 overflow-hidden rounded-full bg-slate-700"><div class="h-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#00C7A5]" :style="{ width: `${(validos / total) * 100}%` }"></div></div><div class="mt-7 grid grid-cols-2 gap-4"><div class="rounded-2xl border border-white/10 bg-white/5 p-5"><div class="flex items-center gap-2 text-xs text-slate-400"><span class="h-2.5 w-2.5 rounded-full bg-[#00C7A5]"></span> Válidos</div><p class="mt-2 text-3xl font-bold">{{ validos.toLocaleString('pt-BR') }}</p></div><div class="rounded-2xl border border-white/10 bg-white/5 p-5"><div class="flex items-center gap-2 text-xs text-slate-400"><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span> Inválidos</div><p class="mt-2 text-3xl font-bold">{{ invalidos }}</p></div></div><p class="mt-5 text-xs text-slate-500">Os números acima são demonstrativos e não representam dados de usuários.</p></div>
        </div>
      </section>

      <!-- Como funciona -->
      <section id="como-funciona" class="scroll-mt-24 border-y border-white/5 bg-[#101D32]/40 py-20 sm:py-24"><div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div class="mx-auto max-w-2xl text-center"><span class="text-xs font-bold uppercase tracking-[0.2em] text-[#38BDF8]">Simples e prático</span><h2 class="mt-4 text-3xl font-extrabold sm:text-4xl">Como funciona?</h2><p class="mt-4 text-slate-400">Três etapas para explorar suas informações com mais clareza.</p></div><div class="mt-12 grid gap-6 md:grid-cols-3"><article v-for="etapa in etapas" :key="etapa.numero" class="relative rounded-3xl border border-white/10 bg-[#101D32] p-7"><span class="absolute right-6 top-5 text-5xl font-black text-white/5">{{ etapa.numero }}</span><div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#38BDF8]/10 text-2xl text-[#38BDF8]"><i :class="etapa.icone"></i></div><span class="mt-6 block text-xs font-bold tracking-widest text-[#00C7A5]">ETAPA {{ etapa.numero }}</span><h3 class="mt-2 text-xl font-bold">{{ etapa.titulo }}</h3><p class="mt-3 text-sm leading-7 text-slate-400">{{ etapa.descricao }}</p></article></div></div></section>

      <!-- Sobre + CTA -->
      <section id="sobre" class="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10"><div class="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#38BDF8]/20 bg-gradient-to-br from-[#101D32] via-[#12243C] to-[#0C2735] px-6 py-14 text-center shadow-2xl shadow-sky-950/20 sm:px-12 sm:py-16"><span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/10 text-2xl text-[#38BDF8]"><i class="fa-solid fa-bolt"></i></span><h2 class="mx-auto mt-6 max-w-2xl text-3xl font-extrabold sm:text-4xl">Pronto para transformar seus dados?</h2><p class="mx-auto mt-5 max-w-xl leading-7 text-slate-300">O CTI Insights reúne importação, validação, relatórios e gráficos em uma experiência moderna e organizada.</p><RouterLink to="/cadastro" class="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#38BDF8] px-7 py-3.5 text-sm font-extrabold text-slate-950 transition hover:-translate-y-1 hover:bg-sky-300">Criar minha conta <i class="fa-solid fa-arrow-right"></i></RouterLink></div></section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-[#080F20]"><div class="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 lg:px-10"><div><div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#38BDF8]"><i class="fa-solid fa-cloud"></i></span><span class="font-extrabold tracking-wider">CTI <span class="text-[#38BDF8]">INSIGHTS</span></span></div><p class="mt-4 max-w-md text-sm leading-7 text-slate-400">Uma plataforma para importar, validar e visualizar dados de maneira simples e inteligente.</p></div><div class="md:text-right"><p class="text-sm font-bold">Contato</p><div class="mt-4 flex items-center gap-3 md:justify-end"><template v-for="contato in contatos" :key="contato.nome"><a v-if="contato.href" :href="contato.href" target="_blank" rel="noopener noreferrer" :aria-label="contato.nome" :title="contato.nome" class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 transition hover:-translate-y-1 hover:border-[#38BDF8]/40 hover:text-[#38BDF8]"><i :class="contato.icone"></i></a><button v-else type="button" :aria-label="`${contato.nome}: contato em breve`" :title="`${contato.nome} — em breve`" class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 transition hover:-translate-y-1 hover:border-[#38BDF8]/40 hover:text-[#38BDF8]" @click="contatoIndisponivel(contato.nome)"><i :class="contato.icone"></i></button></template></div><p class="mt-3 text-xs text-slate-500">Links de contato em configuração</p></div></div><div class="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-500">© {{ anoAtual }} CTI Insights. Projeto de análise e visualização de dados.</div></footer>
  </div>
</template>