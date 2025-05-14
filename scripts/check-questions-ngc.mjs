import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
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

let nbInvalidKYC = 0;

const kycs = await getKYCs();

kycs
  .filter(({ attributes }) => attributes.is_ngc)
  .forEach(({ attributes }) => {
    const ruleName = attributes.ngc_key;

    if (ruleName in parsedRules) {
      questions = questions.filter(({ dottedName }) => dottedName !== ruleName);
    } else {
      ++nbInvalidKYC;
      console.error('\n[ERR] KYC with invalid NGC key:');
      console.log({
        code: attributes.code,
        type: attributes.type,
        question: attributes.question,
        ngc_key: attributes.ngc_key,
      });
    }

    if (attributes.type === 'choix_unique') {
      const possibilities = engine.getPossibilitiesFor(ruleName);
      const responses = attributes.reponses.map(({ reponse, ngc_code }) => ({
        reponse,
        ngc_code,
      }));

      if (possibilities === null && !isBooleanChoixUnique(responses)) {
        ++nbInvalidKYC;
        console.error(`\n[ERR] KYC is no longer of type choix_unique`);
        console.dir(
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
              type: engine.getRule(ruleName)?.type,
            },
          },
          { depth: null },
        );
      }

      if (possibilities && !isBooleanChoixUnique(responses)) {
        const unknown_reponses = responses.filter(({ ngc_code }) => {
          return !possibilities?.some(
            (pos) => pos.publicodesValue === ngc_code,
          );
        });
        if (unknown_reponses.length > 0) {
          ++nbInvalidKYC;
          console.error(`\n[ERR] KYC has unknown responses`);
          console.log({
            KYC: {
              code: attributes.code,
              type: attributes.type,
              question: attributes.question,
              ngc_key: attributes.ngc_key,
            },
            NGC: {
              name: ruleName,
              type: engine.getRule(ruleName)?.type,
            },
            unknown_reponses,
          });
        }
      }
    }
  });

if (questions.length > 0) {
  questions.forEach(({ dottedName, rawNode }) => {
    console.warn(
      `\x1b[0;33m[WARN] Missing [${dottedName}] (${rawNode['question']})\x1b[0m`,
    );
  });
  console.warn(
    `\n\x1b[0;33m[WARN] ${questions.length} questions missing in KYC`,
  );
}

if (nbInvalidKYC > 0) {
  console.error(`\n[ERR] ${nbInvalidKYC} invalid KYC found`);
  process.exit(1);
} else {
  console.log(`\n\n[OK] All KYC are valid`);
}

function isBooleanChoixUnique(responses) {
  return (
    responses.length >= 2 &&
    responses.find((r) => r.ngc_code === 'non') &&
    responses.find((r) => r.ngc_code === 'oui')
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
