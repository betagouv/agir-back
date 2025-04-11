import Engine from 'publicodes';

run();

async function run() {
  // Fetch the latest JSON model from unpkg
  const res = await fetch(
    'https://unpkg.com/mesaidesreno@latest/mesaidesreno.model.json',
  );
  const rules = await res.json();

  const engine = new Engine(rules, {
    warn: {
      unitConversion: false,
    },
  });

  const aidesDefault = engine.evaluate('aides');
  engine.setSituation({
    'vous . propriétaire . statut': '"propriétaire"',
    'logement . propriétaire occupant': 'oui',
  });
  const aides = engine.evaluate('aides');

  console.log('Règles manquantes pour le calcul des aides :');
  Object.keys({
    ...aidesDefault.missingVariables,
    ...aides.missingVariables,
  }).forEach((ruleName) => {
    const rule = engine.getRule(ruleName);
    const question = rule.rawNode.question;
    const type = engine.baseContext.nodesTypes.get(rule).type;
    const possibilities =
      rule.rawNode['une possibilité parmi']?.['possibilités']?.join('\n    - ');

    console.log(
      `\n${ruleName}:\n  type: ${type}${
        possibilities != null ? `\n  enum:\n    - ${possibilities}` : ''
      }\n  question: "${question}"`,
    );
  });
}
