<script setup lang="ts">
// Adresse e-mail pas encore confirmée : il faut cliquer sur le lien reçu pour commander.
const { user, fetchUser, resendVerification } = useAuth()
const sending = ref(false)
const checking = ref(false)

async function resend() {
  sending.value = true
  try {
    await resendVerification()
  } catch (e) {
    useToast().error(apiMessage(e))
  } finally {
    sending.value = false
  }
}

async function recheck() {
  checking.value = true
  await fetchUser()
  checking.value = false
  if (!user.value?.emailVerified) useToast().error('Adresse pas encore confirmée. Pensez à regarder dans les courriers indésirables.')
}
</script>

<template>
  <div class="rounded-lg border border-brand/40 bg-brand/10 p-5">
    <p class="flex items-center gap-2 font-semibold"><Icon name="mail" :size="18" class="shrink-0 text-brand" /> Confirmez votre adresse e-mail pour commander</p>
    <p class="mt-1 text-sm text-gray-300">Un lien a été envoyé à <span class="font-semibold text-white">{{ user?.email }}</span>. Pensez à regarder dans les courriers indésirables.</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <button type="button" class="btn-primary !py-2" :disabled="checking" @click="recheck">J’ai confirmé</button>
      <button type="button" class="btn-ghost !py-2" :disabled="sending" @click="resend">{{ sending ? 'Envoi...' : 'Renvoyer l’e-mail' }}</button>
    </div>
  </div>
</template>
