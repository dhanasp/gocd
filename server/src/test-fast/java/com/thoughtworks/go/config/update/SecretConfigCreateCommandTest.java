/*
 * Copyright 2019 ThoughtWorks, Inc.
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
 */

package com.thoughtworks.go.config.update;

import com.thoughtworks.go.config.BasicCruiseConfig;
import com.thoughtworks.go.config.SecretConfig;
import com.thoughtworks.go.config.exceptions.EntityType;
import com.thoughtworks.go.config.exceptions.RecordNotFoundException;
import com.thoughtworks.go.domain.config.ConfigurationKey;
import com.thoughtworks.go.domain.config.ConfigurationProperty;
import com.thoughtworks.go.domain.config.ConfigurationValue;
import com.thoughtworks.go.helper.GoConfigMother;
import com.thoughtworks.go.plugin.access.secrets.SecretsExtension;
import com.thoughtworks.go.plugin.api.response.validation.ValidationError;
import com.thoughtworks.go.plugin.api.response.validation.ValidationResult;
import com.thoughtworks.go.server.service.GoConfigService;
import com.thoughtworks.go.server.service.result.HttpLocalizedOperationResult;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SecretConfigCreateCommandTest {

    private SecretsExtension extension;
    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Before
    public void setUp() throws Exception {
        extension = mock(SecretsExtension.class);
    }

    @Test
    public void shouldAddSecretConfig() throws Exception {
        BasicCruiseConfig cruiseConfig = GoConfigMother.defaultCruiseConfig();
        SecretConfig secretConfig = new SecretConfig("CreateTest", "File");
        SecretConfigCreateCommand command = new SecretConfigCreateCommand(null, secretConfig, extension, null, null);
        command.update(cruiseConfig);

        assertThat(cruiseConfig.getSecretConfigs().find("CreateTest"), equalTo(secretConfig));
    }

    @Test
    public void shouldInvokePluginValidationsBeforeSave() throws Exception {
        ValidationResult validationResult = new ValidationResult();
        validationResult.addError(new ValidationError("key", "error"));

        SecretConfig newSecretConfig = new SecretConfig("foo", "file", new ConfigurationProperty(new ConfigurationKey("key"), new ConfigurationValue("val")));

        RuleAwarePluginProfileCommand command = new SecretConfigCreateCommand(mock(GoConfigService.class), newSecretConfig, extension, null, new HttpLocalizedOperationResult());

        when(extension.validateSecretsConfig(eq("file"), anyMap())).thenReturn(validationResult);

        BasicCruiseConfig cruiseConfig = new BasicCruiseConfig();

        thrown.expect(RecordNotFoundException.class);
        thrown.expectMessage(EntityType.SecretConfig.notFoundMessage(newSecretConfig.getId()));

        command.isValid(cruiseConfig);
        command.update(cruiseConfig);

        assertThat(newSecretConfig.getConfiguration().first().errors().size(), is(1));
        assertThat(newSecretConfig.getConfiguration().first().errors().asString(), is("error"));
    }
}
