<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
definePageMeta({ alias: ['/MentionLegales'] })
useSeoMeta({ title: 'Mentions légales' })
</script>

<template>
  <LegalPage title="Mentions légales">
    <section>
      <h2>Éditeur du site</h2>
      <p>Le site {{ restaurant.siteUrl.replace('https://', '') }} est édité par {{ restaurant.name }} ({{ restaurant.fullName }}), {{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}.
        <template v-if="restaurant.forSale.enabled"> Ce site est une démonstration : les informations légales définitives (raison sociale, SIRET, responsable de publication) seront complétées par le restaurant qui l’exploitera.</template>
      </p>
    </section>
    <section>
      <h2>Hébergement</h2>
      <p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
    </section>
    <section>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus du site (textes, visuels, logos, mise en forme) sont protégés. Toute reproduction sans autorisation préalable est interdite.</p>
    </section>
    <section>
      <h2>Commandes et paiement</h2>
      <p>Les prix sont indiqués en euros, toutes taxes comprises. Le paiement est traité par Stripe ; aucune donnée bancaire n’est stockée par {{ restaurant.name }}. La commande est confirmée dès la validation du paiement.</p>
    </section>
    <section>
      <h2>Responsabilité</h2>
      <p>{{ restaurant.name }} s’efforce d’assurer l’exactitude des informations publiées. Les photos des plats sont non contractuelles.</p>
    </section>
  </LegalPage>
</template>
