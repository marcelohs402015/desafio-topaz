package com.topaz.shortener.controller;

import com.topaz.shortener.dto.response.ErrorResponse;
import com.topaz.shortener.service.UrlShortenerService;
import com.topaz.shortener.util.ReservedPathValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@Tag(name = "Redirect", description = "Redirecionamento publico de links encurtados")
@SecurityRequirements
public class RedirectController {

    private final UrlShortenerService urlShortenerService;

    public RedirectController(UrlShortenerService urlShortenerService) {
        this.urlShortenerService = urlShortenerService;
    }

    @GetMapping("/{shortCode}")
    @Operation(summary = "Redirecionar link", description = "Endpoint publico que redireciona para a URL original (HTTP 302)")
    @ApiResponses({
            @ApiResponse(responseCode = "302", description = "Redirecionamento para URL original"),
            @ApiResponse(responseCode = "404", description = "Codigo nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> redirect(
            @Parameter(description = "Codigo curto ou alias", example = "minha-alura")
            @PathVariable String shortCode) {
        if (ReservedPathValidator.isReserved(shortCode)) {
            return ResponseEntity.notFound().build();
        }
        String originalUrl = urlShortenerService.resolveOriginalUrl(shortCode);
        HttpHeaders headers = new HttpHeaders();
        try {
            headers.setLocation(URI.create(originalUrl));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
