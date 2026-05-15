-- ============================================================
-- ArrendaHouse — Setup da base de dados
-- Executar no MySQL: bricspt_arrendahouse
-- ============================================================

CREATE TABLE IF NOT EXISTS imoveis (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(255)   NOT NULL,
  cidade      VARCHAR(100)   NOT NULL,
  tipologia   VARCHAR(10)    NOT NULL,
  preco       DECIMAL(10,2)  NOT NULL,
  descricao   TEXT,
  foto        VARCHAR(500),
  disponivel  TINYINT(1)     NOT NULL DEFAULT 1,
  criado_em   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Dados de exemplo (seed) ──
INSERT INTO imoveis (titulo, cidade, tipologia, preco, descricao, foto) VALUES
('Apartamento moderno no centro',       'Lisboa',   'T2', 1200.00, 'Apartamento totalmente renovado, com luz natural e acabamentos de qualidade. Perto de transportes e comércio.',                  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'),
('Studio acolhedor na Baixa',           'Porto',    'T0',  750.00, 'Studio compacto e funcional, ideal para estudantes ou jovens profissionais. Excelente localização.',                              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'),
('Moradia com jardim',                  'Braga',    'T3',  950.00, 'Moradia espaçosa com jardim privativo, garagem e excelente exposição solar. Zona tranquila e residencial.',                    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'),
('Apartamento junto à praia',           'Faro',     'T1',  880.00, 'Apartamento a 5 minutos da praia, com varanda e vista para o jardim. Ótima zona para famílias.',                               'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80'),
('Loft industrial renovado',            'Lisboa',   'T1', 1100.00, 'Loft com pé-direito alto, janelas amplas e decoração contemporânea. Zona de Alcântara, muito bem servida.',                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80'),
('Apartamento familiar espaçoso',       'Coimbra',  'T3',  820.00, 'Apartamento amplo com três quartos, sala grande e cozinha equipada. Perto de escolas e universidade.',                         'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80'),
('Quarto em apartamento partilhado',    'Porto',    'T0',  420.00, 'Quarto individual em apartamento partilhado renovado. Despesas incluídas. Ótimo para estudantes.',                             'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'),
('Moradia de luxo com piscina',         'Cascais',  'T4', 3500.00, 'Moradia de luxo com piscina, jardim paisagístico e garagem para dois carros. Vista mar deslumbrante.',                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80');
