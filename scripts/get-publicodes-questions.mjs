import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
import Engine from 'publicodes';

const engine = new Engine(rules);

const parsedRules = engine.getParsedRules();
let nbQuestions = 0;

const questions = Object.entries(parsedRules)
  .map(([ruleName, ruleNode]) => {
    if (ruleNode.rawNode.question && !ruleName.startsWith('futureco-data')) {
      nbQuestions++;
      return {
        name: ruleName,
        question: ruleNode.rawNode.question,
        type:
          'mosaique' in ruleNode.rawNode
            ? `mosaique (${ruleNode.rawNode.mosaique.type})`
            : engine.context.nodesTypes.get(ruleNode)?.type,
        options: engine.getPossibilitiesFor(ruleName)?.map((pos) => ({
          ruleName: pos.dottedName,
          value: pos.publicodesValue,
        })),
      };
    }
  })
  .filter(Boolean);

console.log(
  JSON.stringify(
    {
      questions,
      nb_total_rules: Object.keys(parsedRules).length,
      nb_questions: nbQuestions,
    },
    null,
    2,
  ),
);
