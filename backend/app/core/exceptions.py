class NotFoundError(Exception):
    """Podany obiekt nie istnieje."""
 
 
class ConflictError(Exception):
    """Operacja kłóci się z obecnym stanem bazy danych (np. próba nadpisania danych)"""
 