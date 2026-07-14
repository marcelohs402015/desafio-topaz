package com.topaz.shortener.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Schema(description = "Requisicao para criar URL encurtada")
public class CreateUrlRequest {

    @NotBlank(message = "URL original e obrigatoria")
    @Pattern(regexp = "https?://.+", message = "URL invalida")
    @Schema(description = "URL original completa", example = "https://www.alura.com.br")
    private String originalUrl;

    @Size(max = 20, message = "Alias deve ter no maximo 20 caracteres")
    @Schema(description = "Alias personalizado (opcional)", example = "minha-alura")
    private String alias;

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }
}
