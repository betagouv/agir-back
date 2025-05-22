import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with {type: 'json'}
import axios from 'axios';
import Engine from 'publicodes';

const engine = new Engine(rules);

const parsedRules = engine.getParsedRules();
let questions = Object.values(parsedRules).filter(
  ({ rawNode, dottedName }) =>
    (rawNode['question'] || rawNode['par défaut']) &&
    !rawNode['mosaique'] &&
    !dottedName.startsWith('futureco-data'),
);

const kycs = await getKYCs();
const errors = [];

kycs
  .filter(
    ({ attributes }) => attributes.is_ngc && attributes.A_SUPPRIMER !== true,
  )
  .forEach(({ attributes }) => {
    const ruleName = attributes.ngc_key;

    if (ruleName in parsedRules) {
      questions = questions.filter(({ dottedName }) => dottedName !== ruleName);
    } else {
      errors.push([
        'KYC with invalid NGC key:',
        {
          code: attributes.code,
          type: attributes.type,
          question: attributes.question,
          ngc_key: attributes.ngc_key,
        },
      ]);
    }

    if (attributes.type === 'choix_unique') {
      const possibilities = engine.getPossibilitiesFor(ruleName);
      const responses = attributes.reponses.map(({ reponse, ngc_code }) => ({
        reponse,
        ngc_code,
      }));

      if (possibilities === null && !isBooleanChoixUnique(responses)) {
        errors.push([
          "KYC should no longer be of type 'choix_unique'",
          {
            KYC: {
              code: attributes.code,
              type: attributes.type,
              question: attributes.question,
              ngc_key: attributes.ngc_key,
              reponses: responses,
            },
            NGC: {
              name: ruleName,
              type: getRuleType(ruleName),
            },
          },
        ]);
      }

      if (possibilities && !isBooleanChoixUnique(responses)) {
        const unknown_reponses = responses.filter(({ ngc_code, reponse }) => {
          return (
            !possibilities?.some((pos) => pos.publicodesValue === ngc_code) &&
            reponse !== 'Je ne sais pas'
          );
        });
        if (unknown_reponses.length > 0) {
          errors.push([
            'KYC has unknown responses',
            {
              KYC: {
                code: attributes.code,
                type: attributes.type,
                question: attributes.question,
                ngc_key: attributes.ngc_key,
              },
              NGC: {
                name: ruleName,
                type: getRuleType(ruleName),
              },
              unknown_reponses,
            },
          ]);
        }
      }
    }
  });

if (questions.length > 0) {
  console.log(`[WARN] ${questions.length} questions missing in KYC:`);
  questions.forEach(({ dottedName, rawNode }) => {
    console.log(`  - "${rawNode['question']}" (${dottedName})`);
  });
}

if (errors.length > 0) {
  errors.forEach(([msg, obj]) =>
    console.log(`\n[ERR] ${msg}\n${JSON.stringify(obj, null, 2)}`),
  );
  console.error(`\n[ERR] ${errors.length} invalid KYC found`);
  if (questions.length > 0) {
    console.log(`[WARN] ${questions.length} questions missing in KYC`);
  }
  process.exit(1);
} else {
  console.log(`\n\n[OK] All KYC are valid`);
  if (questions.length > 0) {
    console.log(`[WARN] ${questions.length} questions missing in KYCs`);
  }
}

function isBooleanChoixUnique(responses) {
  const responses_contains = (ngc_code) =>
    responses.some((r) => r.ngc_code === ngc_code);
  const responses_contains_dont_know = responses.some(
    (r) =>
      r.reponse === 'Je ne sais pas' ||
      r.reponse === 'Je ne souhaite pas répondre',
  );

  return (
    responses_contains('non') &&
    responses_contains('oui') &&
    (responses.length === 2 ||
      (responses.length === 3 && responses_contains_dont_know))
  );
}

async function getKYCs() {
  let result = [];
  let response = null;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CMS_API_KEY}`,
  };

  for (let index = 0; index < 1000; index = index + 100) {
    const URL =
      process.env.CMS_URL +
      `/kycs?populate[0]=reponses&pagination[start]=${index}&pagination[limit]=100`;
    try {
      response = await axios.get(URL, { headers: headers });
    } catch (err) {
      console.error(`ERROR fetching ${URL}: ${err}`);
    }
    result = result.concat(response.data.data);
    if (response.data.data.length === 0) {
      break;
    }
  }

  return result;
}

function getRuleType(ruleName) {
  const rule = engine.getRule(ruleName);

  if (rule) {
    return engine.context.nodesTypes.get(rule)?.type;
  }
}
