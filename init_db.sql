/* Create tables */
CREATE TABLE cart (
  id int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (id),
  UNIQUE KEY id_UNIQUE (id)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = latin1;

CREATE TABLE product (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(128) DEFAULT NULL,
  price int(11) DEFAULT NULL,
  inventory_count int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY id_UNIQUE (id)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = latin1;

CREATE TABLE cart_product (
  id int(11) NOT NULL AUTO_INCREMENT,
  cartId int(11) DEFAULT NULL,
  productId int(11) DEFAULT NULL,
  qty int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY id_UNIQUE (id),
  KEY product_fk_idx (productId),
  KEY cart_fk_idx (cartId),
  CONSTRAINT cart_fk FOREIGN KEY (cartId) REFERENCES cart (id) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT product_fk FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = latin1;



/* Insert products */
INSERT INTO product (name, price, inventory_count) VALUES ("Chair", 120, 12);
INSERT INTO product (name, price, inventory_count) VALUES ("Couch", 425, 7);
INSERT INTO product (name, price, inventory_count) VALUES ("Coffee Table", 190, 23);
INSERT INTO product (name, price, inventory_count) VALUES ("Dining Set", 1850, 2);
INSERT INTO product (name, price, inventory_count) VALUES ("Desk", 140, 0);
