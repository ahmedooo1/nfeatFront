<script setup lang="ts">
import { restaurant } from '~/restaurant.config'
definePageMeta({ alias: ['/politique-confidentialite'] })
useSeoMeta({ title: 'Politique de confidentialité' })
</script>

<template>
  <LegalPage title="Politique de confidentialité">
    <section>
      <h2>Données collectées</h2>
      <ul>
        <li>Compte client : nom, adresse e-mail, mot de passe (stocké chiffré), photo de profil facultative.</li>
        <li>Commandes : plats commandés, montants, dates.</li>
        <li>Avis publiés : contenu et prénom affiché (votre e-mail n’est jamais public).</li>
        <li>Formulaire de contact : nom, e-mail et message, transmis par e-mail au restaurant.</li>
      </ul>
    </section>
    <section>
      <h2>Paiement</h2>
      <p>Les paiements sont traités par Stripe. Vos données bancaires sont saisies directement chez Stripe et ne transitent jamais par nos serveurs.</p>
    </section>
    <section>
      <h2>Cookies</h2>
      <p>Des cookies techniques sont nécessaires à la connexion et au panier. La mesure d’audience (Google Analytics) n’est activée qu’avec votre accord ; vous pouvez changer d’avis à tout moment via le lien « Gérer les cookies » en bas de page.</p>
    </section>
    <section>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous pouvez accéder à vos données, les rectifier ou demander leur suppression en nous écrivant via la page <NuxtLink to="/contact" class="font-semibold underline">Contact</NuxtLink>. Les données de compte sont conservées tant que le compte est actif, puis supprimées.</p>
    </section>
    <section>
      <h2>Responsable du traitement</h2>
      <p>{{ restaurant.name }}, {{ [restaurant.address.street, `${restaurant.address.postalCode} ${restaurant.address.city}`].filter(Boolean).join(', ') }}.</p>
    </section>
  </LegalPage>
</template>
