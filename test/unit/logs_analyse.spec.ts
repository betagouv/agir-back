//import _logs from './connect_1_clean.json';

describe.skip('Analyse de logs', () => {
  it(`compute`, () => {
    // GIVEN

    const LOGS: string[] = []; // = _logs;

    const login_bad_password: string[] = [];
    const login_bad_email: string[] = [];
    const login_bad_code: string[] = [];
    const login_compte_inactif: string[] = [];
    const oubli_mdp_mailok: string[] = [];
    const oubli_mdp_mail_inconnu: string[] = [];
    const modifier_mdp_mail_inconnu: string[] = [];

    for (const log of LOGS) {
      if (log.endsWith('bad password')) {
        if (!login_bad_password.includes(log)) {
          login_bad_password.push(log);
        }
      }
      if (
        log.endsWith('email sending') &&
        log.startsWith('oubli_mot_de_pass')
      ) {
        if (!oubli_mdp_mailok.includes(log)) {
          oubli_mdp_mailok.push(log);
        }
      }
      if (log.endsWith('inconnu') && log.startsWith('oubli_mot_de_pas')) {
        if (!oubli_mdp_mail_inconnu.includes(log)) {
          oubli_mdp_mail_inconnu.push(log);
        }
      }
      if (log.endsWith('mauvais email') && log.startsWith('loginUtilisateur')) {
        if (!login_bad_email.includes(log)) {
          login_bad_email.push(log);
        }
      }
      if (log.endsWith('bad code') && log.startsWith('validateCodePourLogin')) {
        if (!login_bad_code.includes(log)) {
          login_bad_code.push(log);
        }
      }
      if (
        log.endsWith('compte inactif') &&
        log.startsWith('loginUtilisateur')
      ) {
        if (!login_compte_inactif.includes(log)) {
          login_compte_inactif.push(log);
        }
      }
      if (
        log.endsWith('compte inconnu') &&
        log.startsWith('modifier_mot_de_passe')
      ) {
        if (!modifier_mdp_mail_inconnu.includes(log)) {
          modifier_mdp_mail_inconnu.push(log);
        }
      }
    }
    console.log(
      `login_bad_password : [${login_bad_password.length}]
login_bad_email : [${login_bad_email.length}]
login_bad_code : [${login_bad_code.length}]
login_compte_inactif : [${login_compte_inactif.length}]
oubli_mdp_mailok : [${oubli_mdp_mailok.length}]
oubli_mdp_mail_inconnu : [${oubli_mdp_mail_inconnu.length}]
modifier_mdp_mail_inconnu : [${modifier_mdp_mail_inconnu.length}]`,
    );
  });
});
