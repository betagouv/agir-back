import { TestUtil } from '../TestUtil';

TestUtil.ok_appclose = false;

import './api/bibliotheque.controller.int-spec';
import './api/defis.controller.int-spec';
import './api/admin.controller.int-spec';
import './api/aide.controller.int-spec';
import './api/bilan.controller.int-spec';
import './api/bilanCarbone.controller.int-spec';
import './api/communes.controller.int-spec';
import './api/connexion_oubli_mdp.controller.int-spec';
import './api/connexion_v2.controller.int-spec';
import './api/event.controller.int-spec';
import './api/gamification.controller.int-spec';
import './api/inscription.controller.int-spec';
import './api/magicLink.controller.int-spec';
import './api/mission.controller.int-spec';
import './api/mosaicKYC.controller.int-spec';
import './api/notifications.controller.int-spec';
import './api/profile.controller.int-spec';
import './api/questionKYC.controller.int-spec';
import './api/recherchServices.controller.int-spec';
import './api/recommandation.controller.int-spec';
import './api/service.controller.int-spec';
import './api/todo.controller.int-spec';
import './api/univers.controller.int-spec';
import './api/incoming/cms.controller.int-spec';
import './api/incoming/winter.controller.int-spec';
import './api/linky/linky.controller.int-spec';
import './migrations/cartographieStatistique.view.int-spec';
import './migrations/utilisateurStatistique.view.int-spec';
import './repository/aide.repository.int-spec';
import './repository/aideVelo.repository.int-spec';
import './repository/article.repository.int-spec';
import './repository/articleStatistique.repository.int-spec';
import './repository/commune.repository.int-spec';
import './repository/defi.repository.int-spec';
import './repository/emailTemplate.repository.int-spec';
import './repository/linky.repository.int-spec';
import './repository/quizStatistique.repository.int-spec';
import './repository/quizStatistique.repository.int-spec';
import './repository/quizz.repository.int-spec';
import './repository/service.repository.int-spec';
import './repository/statdb_test.int-spec';
import './repository/statistique.repository.int-spec';
import './repository/thematique.repository.int-spec';
import './repository/thematiqueStatistique.repository.int-spec';
import './repository/universStatistique.repository.int-spec';
import './repository/utilisateur.repository.int-spec';
import './repository/utilisateurBoard.repository.int-spec';
import './repository/services_recherche/presdechevous.repository.int-spec';
import './services/linkyServiceManager.int-spec';
import './usecase/linky.usecase.int-spec';
import './personalisation.int-spec';