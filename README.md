# Paiement euro numerique - demo

Demo HTML/Node.js pour un parcours de paiement e-EUR par QR ou NFC.

## Lancer en local

```bash
npm start
```

Puis ouvrir :

```text
http://localhost:8765/index.html
```

## Heberger en ligne

Cette demo a besoin d'un serveur Node.js pour les routes `/status`, `/confirm` et `/reset`.
GitHub Pages peut stocker le code, mais ne peut pas executer `server.js`.

Pour obtenir un lien public fonctionnel :

1. Importer ce depot sur Render.
2. Choisir un Web Service Node.js.
3. Utiliser `npm start` comme Start command.
4. Partager l'URL publique fournie par Render.
