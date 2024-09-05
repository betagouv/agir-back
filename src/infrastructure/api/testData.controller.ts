import { v4 as uuidv4 } from 'uuid';
import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { Suivi } from '../../../src/domain/suivi/suivi';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const service_catalogue = require('../../../src/usecase/referentiel/service_catalogue');
const _linky_data = require('../../../test_data/PRM_thermo_pas_sensible');
const suivis_alimentation = require('../../../test_data/evenements/suivis_alimentation');
const suivis_transport = require('../../../test_data/evenements/suivis_transport');
const empreintes_utilisateur = require('../../../test_data/evenements/bilans');
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { LinkyRepository } from '../repository/linky.repository';
import { ServiceStatus } from '../../../src/domain/service/service';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { Transport } from '../../../src/domain/transport/transport';
import { Logement } from '../../../src/domain/logement/logement';
import { Contact } from '../contact/contact';
import { ContactSynchro } from '../contact/contactSynchro';
import { GenericControler } from './genericControler';

@Controller()
@ApiTags('TestData')
@ApiBearerAuth()
export class TestDataController extends GenericControler {
  constructor(
    private prisma: PrismaService,
    private suiviRepository: SuiviRepository,
    private linkyRepository: LinkyRepository,
    private migrationUsecase: MigrationUsecase,
    public contactSynchro: ContactSynchro,
    private utilisateurRepository2: UtilisateurRepository,
  ) {
    super();
  }

  @Post('creer_contact_brevo/:email')
  @ApiParam({ name: 'email' })
  async creerContact(@Param('email') email: string, @Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    const contact = new Contact({
      email: email,
      ext_id: uuidv4(),
      smsBlacklisted: false,
      smtpBlacklistSender: [],
      emailBlacklisted: false,
      attributes: {
        POINTS: 15,
        EMAIL: email,
        CODE_POSTAL: '91120',
        DERNIERE_ACTIVITE: new Date(),
        NIVEAU: 2,
        FIRSTNAME: 'toto',
        LASTNAME: 'titi',
      },
    });
    await this.contactSynchro.createContactFromContact(contact);
  }

  @Get('testdata/:id')
  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  async GetData(@Param('id') id: string) {
    return utilisateurs_content[id] || {};
  }

  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  @Post('testdata/:id/inject')
  async injectData(@Param('id') inputId: string): Promise<string> {
    if (inputId === 'ALL_USERS') {
      for (const utilisateurId in utilisateurs_liste) {
        await this.injectUserId(utilisateurId);
      }
      return 'OK';
    } else {
      return await this.injectUserId(inputId);
    }
  }

  async injectUserId(utilisateurId: string): Promise<string> {
    if (!utilisateurs_content[utilisateurId]) return '{}';
    await this.deleteUtilisateur(utilisateurId);
    await this.upsertUtilisateur(utilisateurId);
    await this.upsertServicesDefinitions();
    await this.insertServicesForUtilisateur(utilisateurId);
    await this.insertLinkyDataForUtilisateur(utilisateurId);
    await this.insertSuivisAlimentationForUtilisateur(utilisateurId);
    await this.insertEmpreintesForUtilisateur(utilisateurId);
    return utilisateurs_content[utilisateurId];
  }

  async upsertServicesDefinitions() {
    const keyList = Object.keys(service_catalogue);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = service_catalogue[serviceId];
      const data = { ...service };
      data.id = serviceId;
      delete data.configuration;
      await this.prisma.serviceDefinition.upsert({
        where: {
          id: serviceId,
        },
        update: data,
        create: data,
      });
    }
  }

  async insertSuivisAlimentationForUtilisateur(utilisateurId: string) {
    const suivis = utilisateurs_content[utilisateurId].suivis;
    if (!suivis) return;
    for (let index = 0; index < suivis.length; index++) {
      const suiviId = suivis[index];
      let suiviToCreate: Suivi;
      if (suivis_alimentation[suiviId]) {
        suiviToCreate = new SuiviAlimentation(
          new Date(Date.parse(suivis_alimentation[suiviId].date)),
        );
        suiviToCreate.injectValuesFromObject(suivis_alimentation[suiviId]);
      } else if (suivis_transport[suiviId]) {
        suiviToCreate = new SuiviTransport(
          new Date(Date.parse(suivis_transport[suiviId].date)),
        );
        suiviToCreate.injectValuesFromObject(suivis_transport[suiviId]);
      }
      suiviToCreate.calculImpacts();
      await this.suiviRepository.createSuivi(suiviToCreate, utilisateurId);
    }
  }
  async insertEmpreintesForUtilisateur(utilisateurId: string) {
    const empreintes = utilisateurs_content[utilisateurId].bilans;
    if (!empreintes) return;
    for (let index = 0; index < empreintes.length; index++) {
      const empreinteId = empreintes[index];
      const empreinte = empreintes_utilisateur[empreinteId];
      if (empreinte) {
        const situationId = uuidv4();
        await this.prisma.situationNGC.create({
          data: {
            id: situationId,
            situation: empreinte.situation,
          },
        });
        let data = {
          ...empreinte,
          created_at: new Date(Date.parse(empreinte.date)),
          id: uuidv4(),
          utilisateurId,
          situationId,
          date: undefined,
          situation: undefined,
        };
        await this.prisma.empreinte.create({
          data,
        });
      }
    }
  }
  async insertServicesForUtilisateur(utilisateurId: string) {
    const services = utilisateurs_content[utilisateurId].services;
    if (!services) return;
    for (let index = 0; index < services.length; index++) {
      const serviceId = services[index];
      if (service_catalogue[serviceId]) {
        let data = {
          id: uuidv4(),
          utilisateurId: utilisateurId,
          serviceDefinitionId: serviceId,
          status: ServiceStatus.LIVE,
          configuration: service_catalogue[serviceId].configuration
            ? service_catalogue[serviceId].configuration
            : {},
        };
        await this.prisma.service.create({
          data,
        });
      }
    }
  }
  async insertLinkyDataForUtilisateur(utilisateurId: string) {
    const linky = utilisateurs_content[utilisateurId].linky;
    if (!linky) return;
    await this.linkyRepository.upsertLinkyEntry(
      linky.prm,
      linky.winterpk,
      utilisateurId,
    );
    await this.linkyRepository.upsertDataForPRM(linky.prm, _linky_data);
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.prisma.suivi.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.service.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.empreinte.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.utilisateur.deleteMany({
      where: { id: utilisateurId },
    });
  }
  async upsertUtilisateur(utilisateurId: string) {
    const clonedData = { ...utilisateurs_content[utilisateurId] };
    delete clonedData.suivis;
    delete clonedData.interactions;
    delete clonedData.bilans;
    delete clonedData.services;
    delete clonedData.questionsNGC;
    delete clonedData.linky;

    if (!clonedData.todo) {
      clonedData.todo = new ParcoursTodo();
    }

    PasswordManager.setUserPassword(clonedData, clonedData.mot_de_passe);
    delete clonedData.mot_de_passe;

    await this.prisma.utilisateur.upsert({
      where: {
        id: utilisateurId,
      },
      update: clonedData,
      create: { ...clonedData, id: utilisateurId },
    });

    await this.migrationUsecase.migrateUsers();

    const utilisatateur = await this.utilisateurRepository2.getById(
      utilisateurId,
    );
    utilisatateur.logement = Logement.buildFromOnboarding(
      utilisatateur.onboardingData,
    );
    utilisatateur.transport = Transport.buildFromOnboarding(
      utilisatateur.onboardingData,
    );
    utilisatateur.recomputeRecoTags();
    await this.utilisateurRepository2.updateUtilisateur(utilisatateur);
  }
}
