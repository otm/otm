
delimiter |
CREATE TRIGGER update_trails BEFORE UPDATE ON trails
  FOR EACH ROW BEGIN
    INSERT INTO hist_trails SET (id, gpx, polyline, name, description, grade, type, mod_user_id) VALUES (OLD.id, OLD.gpx, OLD.polyline, OLD.name, OLD.description, OLD.grade, OLD.type, NEW.mod_user_id);
  END
|
