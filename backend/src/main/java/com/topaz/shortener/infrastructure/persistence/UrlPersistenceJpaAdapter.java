package com.topaz.shortener.infrastructure.persistence;

import com.topaz.shortener.domain.UrlMapping;
import com.topaz.shortener.port.UrlPersistencePort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UrlPersistenceJpaAdapter implements UrlPersistencePort {

    private final UrlMappingJpaRepository repository;

    public UrlPersistenceJpaAdapter(UrlMappingJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public UrlMapping save(UrlMapping entity) {
        return repository.save(entity);
    }

    @Override
    public Optional<UrlMapping> findByShortCode(String shortCode) {
        return repository.findByShortCode(shortCode);
    }

    @Override
    public boolean existsByShortCode(String shortCode) {
        return repository.existsByShortCode(shortCode);
    }

    @Override
    public boolean existsByShortCodeAndIdNot(String shortCode, Long id) {
        return repository.existsByShortCodeAndIdNot(shortCode, id);
    }

    @Override
    public Optional<UrlMapping> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<UrlMapping> findAllOrderByCreatedAtDesc() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public int incrementAccessCount(String shortCode) {
        return repository.incrementAccessCount(shortCode);
    }
}
