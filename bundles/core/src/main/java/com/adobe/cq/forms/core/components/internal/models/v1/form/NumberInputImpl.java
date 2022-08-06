/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2022 Adobe
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
package com.adobe.cq.forms.core.components.internal.models.v1.form;

import java.util.Map;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.adobe.cq.forms.core.components.internal.form.FormConstants;
import com.adobe.cq.forms.core.components.models.form.NumberInput;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { NumberInput.class,
        ComponentExporter.class },
    resourceType = { FormConstants.RT_FD_FORM_NUMBER_INPUT_V1 })
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class NumberInputImpl extends AbstractFieldImpl implements NumberInput {

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL, name = "leadDigits")
    @Nullable
    protected Integer leadDigits;

    @ValueMapValue(injectionStrategy = InjectionStrategy.OPTIONAL, name = "fracDigits")
    @Nullable
    protected Integer fracDigits;

    @Override
    protected FieldType getDefaultFieldType() {
        return FieldType.NUMBER_INPUT;
    }

    @Override
    public Long getMinimum() {
        return minimum;
    }

    @Override
    public Long getMaximum() {
        return maximum;
    }

    @Override
    public Long getExclusiveMaximum() {
        return exclusiveMaximum;
    }

    @Override
    public Long getExclusiveMinimum() {
        return exclusiveMinimum;
    }

    @Override
    public @Nullable Integer getLeadDigits() {
        return leadDigits;
    }

    @Override
    public @Nullable Integer getFracDigits() {
        return fracDigits;
    }

    @Override
    public @NotNull Map<String, Object> getCustomProperties() {
        Map<String, Object> customProperties = super.getCustomProperties();
        if (leadDigits != null) {
            customProperties.put("leadDigits", leadDigits);
        }
        if (fracDigits != null) {
            customProperties.put("fracDigits", fracDigits);
        }
        return customProperties;
    }
}