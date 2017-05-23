/*
 * Copyright (c) 2015-2017 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

import {NamespaceSelectorSvc} from './namespace-selector/namespace-selector.service';
import {CheWorkspace} from '../../../components/api/che-workspace.factory';

/**
 * todo
 *
 * @author Oleksii Kurinnyi
 */
export class CreateWorkspaceSvc {
  /**
   * Location service.
   */
  private $location: ng.ILocationService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Workspace API interaction.
   */
  private cheWorkspace: CheWorkspace;
  /**
   * Namespace selector service.
   */
  private namespaceSelectorSvc: NamespaceSelectorSvc;
  /**
   * The list of workspaces by namespace.
   */
  private workspacesByNamespace: {
    [namespaceId: string]: Array<che.IWorkspace>
  };

  // todo
  private workspaceOfProject: any;
  // todo
  private namespace: string;
  // todo
  private project: any;
  // todo
  private ideAction: any;

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($location: ng.ILocationService, $q: ng.IQService, cheWorkspace: CheWorkspace, namespaceSelectorSvc: NamespaceSelectorSvc) {
    this.$location = $location;
    this.$q = $q;
    this.cheWorkspace = cheWorkspace;
    this.namespaceSelectorSvc = namespaceSelectorSvc;

    this.workspacesByNamespace = {};
  }

  /**
   * Fills in list of workspace's name in current namespace,
   * and triggers validation of entered workspace's name
   *
   * @param {string} namespaceId a namespace ID
   * @return {IPromise<any>}
   */
  fetchWorkspacesByNamespace(namespaceId: string): ng.IPromise<any> {
    return this.getOrFetchWorkspacesByNamespace(namespaceId).then((workspaces: Array<che.IWorkspace>) => {
      return this.$q.when(workspaces);
    }, (error: any) => {
      // user is not authorized to get workspaces by namespace
      return this.getOrFetchWorkspaces();
    }).then((workspaces: Array<che.IWorkspace>) => {
      this.workspacesByNamespace[namespaceId] = workspaces;
      return this.$q.when(workspaces);
    });
  }

  /**
   * Returns promise for getting list of workspaces by namespace.
   *
   * @param {string} namespaceId a namespace ID
   * @return {ng.IPromise<any>}
   */
  getOrFetchWorkspacesByNamespace(namespaceId: string): ng.IPromise<any> {
    const defer = this.$q.defer();

    const workspacesByNamespaceList = this.cheWorkspace.getWorkspacesByNamespace(namespaceId) || [];
    if (workspacesByNamespaceList.length) {
      defer.resolve(workspacesByNamespaceList);
    } else {
      this.cheWorkspace.fetchWorkspacesByNamespace(namespaceId).then(() => {
        defer.resolve(this.cheWorkspace.getWorkspacesByNamespace(namespaceId) || []);
      }, (error: any) => {
        // not authorized
        defer.reject(error);
      });
    }

    return defer.promise;
  }

  /**
   * Returns promise for getting list of workspaces owned by user
   *
   * @return {ng.IPromise<any>}
   */
  getOrFetchWorkspaces(): ng.IPromise<any> {
    const defer = this.$q.defer();
    const workspacesList = this.cheWorkspace.getWorkspaces();
    if (workspacesList.length) {
      defer.resolve(workspacesList);
    } else {
      this.cheWorkspace.fetchWorkspaces().finally(() => {
        defer.resolve(this.cheWorkspace.getWorkspaces());
      });
    }

    return defer.promise;
  }


  // review methods below
  // whether they necessary or not

  setWorkspaceOfProject(workspaceOfProject: any): void {
    this.workspaceOfProject = workspaceOfProject;
  }

  getWorkspaceOfProject(): void {
    return this.workspaceOfProject;
  }

  setWorkspaceNamespace(namespace: string): void {
    this.namespace = namespace;
  }

  getWorkspaceNamespace(): string {
    return this.namespace;
  }

  setProject(project: any): void {
    this.project = project;
  }

  getProject(): any {
    return this.project;
  }

  hasIdeAction(): boolean {
    return this.getIDEAction().length > 0;
  }

  getIDEAction(): any {
    return this.ideAction;
  }

  setIDEAction(ideAction: any): void {
    this.ideAction = ideAction;
  }

  getIDELink(): string {
    let link = '#/ide/' + this.getWorkspaceNamespace() + '/' + this.getWorkspaceOfProject();
    if (this.hasIdeAction()) {
      link = link + '?action=' + this.ideAction;
    }
    return link;
  }

  redirectToIDE(): void {
    const path = '/ide/' + this.getWorkspaceNamespace() + '/' + this.getWorkspaceOfProject();
    this.$location.path(path);

    if (this.getIDEAction()) {
      this.$location.search({'action': this.getIDEAction()});
    }
  }

}
