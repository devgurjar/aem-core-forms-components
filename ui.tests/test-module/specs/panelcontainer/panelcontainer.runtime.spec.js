/*******************************************************************************
 * Copyright 2022 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
describe( "Form Runtime with Panel Container", () => {

    const pagePath = "content/forms/af/core-components-it/samples/panelcontainer/basic.html";
    const bemBlock = 'cmp-container';
    let formContainer = null;

    beforeEach(() => {
        cy.previewFormWithPanel(pagePath).then(p => {
            formContainer = p;
        });
    });

    const checkHTML = (id, model, view) => {
        const visible = model.visible;
        const passVisibleCheck = `${visible === true ? "" : "not."}be.visible`;
        cy.get(`#${id}`)
            .should(passVisibleCheck)
            .invoke('attr', 'data-cmp-visible')
            .should('eq', visible.toString());
        cy.get(`#${id}`)
            .invoke('attr', 'data-cmp-enabled')
            .should('eq', model.enabled.toString());
        expect(model.items.length, "model has children equal to count").to.equal(view.children.length);
        return cy.get('[data-cmp-is="adaptiveFormContainer"]');
    };

    const checkInstanceHTML = (instanceManager, count) => {
        expect(instanceManager.children.length, "instance manager has children equal to count").to.equal(count);
        expect(instanceManager.getModel().items.length, "model has items equal to count").to.equal(count);
        const checkChild = (childView) => {
            checkHTML(childView.getId(), childView.getModel(), childView);
        }
        instanceManager.children.forEach(checkChild);
        return cy.get('[data-cmp-is="adaptiveFormContainer"]');
    };

    const checkAddRemoveInstance = (instanceManager, count, isAdd, childCount) => {
        const EVENT_NAME = isAdd ? "AF_PanelInstanceAdded" : "AF_PanelInstanceRemoved";
        let innerResolution = undefined;
        const innerPromise = new Cypress.Promise((resolve, reject) => {innerResolution = resolve;});

        let resolution = undefined;
        cy.get('[data-cmp-is="adaptiveFormContainer"]').then(formElement => {
            const listener1 = e => {
                formElement[0].removeEventListener(EVENT_NAME, listener1);
                resolution(e.detail);
            };
            formElement[0].addEventListener(EVENT_NAME, listener1);
        })
        .then(() => {
            const promise = new Cypress.Promise((resolve, reject) => {resolution = resolve;});
            if (isAdd == true) {
                instanceManager.addInstance();
            } else {
                instanceManager.removeInstance();
            }
            promise.then(() => {
                const e = checkInstanceHTML(instanceManager, count, childCount);
                innerResolution(e);
            });
        });

        return innerPromise;
    };

    it(" should get model and view initialized properly and parent child relationship is set ", () => {
        expect(formContainer, "formcontainer is initialized").to.not.be.null;
        const fields = formContainer.getAllFields();
        Object.entries(fields).forEach(([id, field]) => {
            expect(field.getId()).to.equal(id);
            expect(formContainer._model.getElement(id), `model and view are in sync`).to.equal(field.getModel());
        });

        const panelId = formContainer._model.items[0].items[0].id;
        const datepickerId = formContainer._model.items[0].items[0].items[0].id;
        const panelView = fields[panelId];
        const datepickerView = fields[datepickerId];
        expect(panelView, "panel view is created").to.not.be.null;
        expect(datepickerView, "panel child view is created").to.not.be.null;
        expect(panelView.children.length, "panel has one child").to.equal(1);
        expect(panelView.children[0].id, "panel has reference to child view").to.equal(datepickerId);
        expect(datepickerView.parentView.id, "date picker has reference to parent panel view").to.equal(panelId);
    })

    it(" model's changes are reflected in the html ", () => {
        const panelId = formContainer._model.items[0].items[0].id;
        const model = formContainer._model.getElement(panelId);
        const panelView = formContainer.getAllFields()[panelId];
        const count = 1;
        checkHTML(model.id, model.getState(), panelView, count).then(() => {
            model.visible = false;
            return checkHTML(model.id, model.getState(), panelView, count);
        }).then(() => {
            model.enable = false;
            return checkHTML(model.id, model.getState(), panelView, count);
        });
    });

    it(" add instance and remove instance of model is reflected in html ", () => {
        const panelId = formContainer._model.items[0].items[0].id;
        const panelModel = formContainer._model.getElement(panelId);
        const panelView = formContainer.getAllFields()[panelId];
        const instanceManager = panelView.getInstanceManager();

        panelModel.visible = true;
        panelModel.enable = true;


        checkInstanceHTML(instanceManager, 1)
        .then(() => {
            checkAddRemoveInstance(instanceManager, 2, true)
            .then(() => {
                checkAddRemoveInstance(instanceManager, 3, true)
                .then(() => {
                    checkAddRemoveInstance(instanceManager, 4, true)
                    .then(() => {
                        //max is 4
                        instanceManager.addInstance();
                        checkInstanceHTML(instanceManager, 4);
                        checkAddRemoveInstance(instanceManager, 3)
                        .then(() => {
                            checkAddRemoveInstance(instanceManager, 2)
                            .then(() => {
                                checkAddRemoveInstance(instanceManager, 1)
                                .then(() => {
                                    checkAddRemoveInstance(instanceManager, 0)
                                    .then(() => {
                                        //can't go below zero
                                        instanceManager.removeInstance();
                                        checkInstanceHTML(instanceManager, 0);
                                        //ability to add instance from zero
                                        checkAddRemoveInstance(instanceManager, 1, true);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it(" min occur of model should be reflected in html, and view child should be established ", () => {
        const instancManagerModel = formContainer._model.items[1];
        const instanceManagerView = formContainer.getAllFields()[instancManagerModel.id];
        const instancesView = instanceManagerView.children;
        const instancesModel = instancManagerModel.items;

        expect(instancesView.length, " Number of instances view to equal Number of instances model ").to.equal(instancesModel.length);

        for (let i = 0; i < instancesModel.length; i++) {
            const modelId = instancesModel[i].id;
            expect(instancesView[i].getId(), " Panel view Id to be equal for same index panel model Id ").to.equal(modelId);
            cy.get(`#${modelId}-label`).should('exist');
            cy.get(`#${modelId}-label`).invoke('attr', 'for').should('eq', modelId);
            cy.get(`#${modelId}-shortDescription`).should('exist');
            cy.get(`#${modelId}-longDescription`).should('exist');
            expect(instancesView[i].children.length, " Number of children inside repeatable panel view should be equal to its child models  ").to.equal(instancesModel[i].items.length);

            const textInputId = instancesModel[i].items[0].id;
            expect(instancesView[i].children[0].getId(), " Text input box view Id inside repeatable panel to be equal to its model  ").to.equal(textInputId);
            cy.get(`#${textInputId}-label`).should('exist');
            cy.get(`#${textInputId}-label`).invoke('attr', 'for').should('eq', textInputId);
            cy.get(`#${textInputId}-errorMessage`).should('exist');

            const numberInputId = instancesModel[i].items[1].id;
            expect(instancesView[i].children[1].getId(), " Number input box view Id inside repeatable panel to be equal to its model  ").to.equal(numberInputId);
            cy.get(`#${numberInputId}-label`).should('exist');
            cy.get(`#${numberInputId}-label`).invoke('attr', 'for').should('eq', numberInputId);
            cy.get(`#${numberInputId}-errorMessage`).should('exist');
        }


        checkInstanceHTML(instanceManagerView, 4)
            .then(() => {
                checkAddRemoveInstance(instanceManagerView, 5, true)
                    .then(() => {
                        checkAddRemoveInstance(instanceManagerView, 4)
                            .then(() => {
                                //min is 4, can't go below this
                                checkAddRemoveInstance(instanceManagerView, 4);
                            });
                    });
            });
    });

    it("should toggle description and tooltip", () => {
        cy.toggleDescriptionTooltip(bemBlock, 'tooltip_scenario_test', 'panel short', 'panel long');
    })
})