@startuml PU2_Frontend_Classes

title PU2 - Rezerwacja czasu dla gry\nDiagram klas komponentu frontendu

skinparam classAttributeIconSize 0
skinparam packageStyle rectangle

package "Frontend - Rezerwacja czasu dla gry" {

    class KalendarzView {
        +wyświetlKalendarz()
        +zmieńMiesiąc()
        +wybierzTermin()
        +rozpocznijRezerwację()
        +odświeżKalendarz()
    }

    class KalendarzViewModel {
        -aktualnyMiesiąc
        -wydarzenia
        +pobierzWydarzenia()
        +sprawdźDostępność()
        +otwórzFormularzRezerwacji()
        +odświeżWydarzenia()
    }

    class FormularzRezerwacjiView {
        +wyświetlFormularz()
        +wybierzGrę()
        +wybierzMiejsce()
        +ustawDatę()
        +ustawGodzinę()
        +zatwierdźRezerwację()
        +anuluj()
    }

    class FormularzRezerwacjiViewModel {
        -wybranaGra
        -wybraneMiejsce
        -data
        -godzina
        -statusRezerwacji
        +ustawGrę()
        +ustawMiejsce()
        +ustawTermin()
        +walidujDane()
        +rozpocznijRezerwację()
        +potwierdźRezerwację()
        +cofnijRezerwację()
    }

    class ListaGierView {
        -frazaWyszukiwania
        +wyświetlGry()
        +wyszukajGrę()
        +wybierzGrę()
    }

    class WyborMiejscaView {
        +wyświetlDostępneMiejsca()
        +wybierzMiejsce()
    }

    class SelektorTerminuView {
        +wyświetlDostępneTerminy()
        +wybierzDatę()
        +wybierzGodzinę()
    }

    class PotwierdzenieRezerwacjiView {
        +wyświetlPodsumowanie()
        +potwierdź()
        +cofnij()
    }

    class RezerwacjaService {
        +pobierzDostępneTerminy()
        +sprawdźDostępność()
        +utwórzRezerwację()
        +potwierdźRezerwację()
        +cofnijRezerwację()
    }
}

KalendarzView --> KalendarzViewModel
KalendarzViewModel --> RezerwacjaService

KalendarzViewModel --> FormularzRezerwacjiView : otwiera
FormularzRezerwacjiView --> FormularzRezerwacjiViewModel
FormularzRezerwacjiView --> ListaGierView
FormularzRezerwacjiView --> WyborMiejscaView
FormularzRezerwacjiView --> SelektorTerminuView

FormularzRezerwacjiViewModel --> RezerwacjaService
FormularzRezerwacjiViewModel --> PotwierdzenieRezerwacjiView : po wyborze terminu

PotwierdzenieRezerwacjiView --> FormularzRezerwacjiViewModel : potwierdzenie lub cofnięcie
@enduml
