package com.topaz.shortener.controller;

import com.topaz.shortener.dto.request.CreateUrlRequest;
import com.topaz.shortener.dto.request.UpdateUrlRequest;
import com.topaz.shortener.dto.response.ErrorResponse;
import com.topaz.shortener.dto.response.UrlResponse;
import com.topaz.shortener.service.UrlShortenerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/urls")
@Tag(name = "URLs", description = "Operacoes de encurtamento e gerenciamento de links")
@SecurityRequirement(name = "basicAuth")
public class UrlController {

    private final UrlShortenerService urlShortenerService;

    public UrlController(UrlShortenerService urlShortenerService) {
        this.urlShortenerService = urlShortenerService;
    }

    @GetMapping
    @Operation(summary = "Listar URLs salvas", description = "Retorna todas as URLs encurtadas ordenadas por data de criacao")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UrlResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Nao autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<UrlResponse>> list() {
        return ResponseEntity.ok(urlShortenerService.list());
    }

    @PostMapping
    @Operation(summary = "Encurtar URL", description = "Cria um novo link encurtado com alias opcional")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "URL criada",
                    content = @Content(schema = @Schema(implementation = UrlResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Nao autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Alias ja em uso",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UrlResponse> create(@Valid @RequestBody CreateUrlRequest request) {
        UrlResponse response = urlShortenerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar URL", description = "Atualiza a URL original e/ou o alias de um link existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "URL atualizada",
                    content = @Content(schema = @Schema(implementation = UrlResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Nao autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "URL nao encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Alias ja em uso",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UrlResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUrlRequest request) {
        UrlResponse response = urlShortenerService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir URL", description = "Remove um link encurtado pelo identificador")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "URL excluida"),
            @ApiResponse(responseCode = "401", description = "Nao autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "URL nao encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        urlShortenerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
